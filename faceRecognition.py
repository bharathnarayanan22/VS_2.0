from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import cv2
import os
import numpy as np
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB configuration
app.config['MONGO_URI'] = 'mongodb://localhost:27017/voting_system'
mongo = PyMongo(app)

# Load the Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Initialize the LBPH face recognizer
recognizer = cv2.face.LBPHFaceRecognizer_create()

# Directory to save face images
dataset_dir = 'face_dataset'

if not os.path.exists(dataset_dir):
    os.makedirs(dataset_dir)

# Endpoint to capture and save face image
@app.route('/capture', methods=['POST'])
def capture_face():
    data = request.get_json()
    name = data['name']
    image_data_list = data['image']

    label_dir = os.path.join(dataset_dir, name)
    if not os.path.exists(label_dir):
        os.makedirs(label_dir)

    count = len(os.listdir(label_dir))
    image_paths = []
    for image_data in image_data_list:
        # Convert base64 to image
        nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        for (x, y, w, h) in faces:
            face = gray[y:y+h, x:x+w]
            resized_face = cv2.resize(face, (100, 100))
            file_name_path = os.path.join(label_dir, f'{count}.jpg')
            cv2.imwrite(file_name_path, resized_face)

            # Collect image paths
            image_paths.append(file_name_path)

            # Save face image metadata to MongoDB
            mongo.db.faces.update_one(
                {'label': name},
                {
                    '$setOnInsert': {
                        'hasVoted': False  # Set default value for hasVoted
                    },
                    '$push': {'imagePaths': file_name_path}
                },
                upsert=True
            )

            count += 1

    return jsonify({"message": "Images captured and stored successfully"}), 200

@app.route('/recognize', methods=['POST'])
def recognize_face():
    data = request.get_json()
    image_data = data.get('image', '')

    # Convert base64 to image
    nparr = np.frombuffer(base64.b64decode(image_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "Image decoding failed"}), 400

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    if len(faces) == 0:
        return jsonify({"error": "No face detected"}), 400

    # Load and train the recognizer with saved data
    face_data = []
    labels = []
    names = []

    users = mongo.db.faces.find()  # Assuming you're fetching faces collection
    for user in users:
        for image_path in user['imagePaths']:
            image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            if image is not None:
                face_data.append(image)
                labels.append(len(names))  # Use index as label
                names.append(user['label'])  # Save the name

    if len(face_data) == 0:
        return jsonify({"error": "No training data available"}), 400

    recognizer.train(face_data, np.array(labels))

    recognized_name = None
    confidence = None

    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        resized_face = cv2.resize(face, (100, 100))
        label, confidence = recognizer.predict(resized_face)
        recognized_name = names[label]  # Map label to name
        break

    if recognized_name:
        user = mongo.db.faces.find_one({"label": recognized_name})
        if user:
            if user.get('hasVoted', False):
                return jsonify({"name": recognized_name, "message": "Already voted", "confidence": confidence}), 200
            else:
                # Update the user's hasVoted field to true
                mongo.db.faces.update_one(
                    {"label": recognized_name},
                    {"$set": {"hasVoted": True}}
                )
                return jsonify({"name": recognized_name, "message": "Verification successful. You can vote now.", "confidence": confidence}), 200

    return jsonify({"error": "Face not recognized"}), 400

if __name__ == "__main__":
    app.run(debug=True)