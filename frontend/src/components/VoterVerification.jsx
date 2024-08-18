import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import styles from './VoterVerification.module.css';
import loadingSpinner from './loading-spinner.gif';
import axios from 'axios';

const VoterVerification = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const webcamRef = React.useRef(null);



  const verifyUser = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {

      try {
        const response = await axios.post('http://127.0.0.1:5000/recognize', {
          image: imageSrc.split(',')[1],  
        });
        console.log(response.data)

        if (!response) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Server response:', response.data);
        displayResult(response.data);
      } catch (error) {
        console.error('Error sending snapshot:', error);
      }
    }
  };


  const displayResult = (data) => {
    if (data.error) {
      setResult(data.error);
    } else if (data.message === "Already voted") {
      setResult("You have already voted.");
      alert("You have already voted.");  // Show an alert to the user
    } else {
      setResult(`Detected face: ${data.name}`);
      navigate('/voter');  // Redirect to the voter page after successful verification
    }
    setLoading(false);
  };
    

  const handleDetectUser = (event) => {
    event.preventDefault();
    verifyUser();
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}></div>
      <div className={styles.rightPanel}>
        <h1 className={styles.heading}>Verification Page</h1>

        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className={styles.video}
        />
        <form className={styles.form} onSubmit={handleDetectUser}>
          <button className={styles.button} type="submit" disabled={loading}>
            Verify
          </button>
        </form>
        {loading && (
          <div className={styles.loadingOverlay}>
            <img src={loadingSpinner} alt="Loading..." className={styles.loadingSpinner} />
          </div>
        )}
        <p className={styles.result}>{result}</p>
      </div>
    </div>
  );
};

export default VoterVerification;
