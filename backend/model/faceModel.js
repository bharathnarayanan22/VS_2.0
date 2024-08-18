const mongoose = require("mongoose");

const faceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  hasVoted: {
    type: Boolean,
    default: false,
  },
  imagePaths: {
    type: [String],  
    default: [],
  },
});
const Face = mongoose.model("Face", faceSchema);

module.exports = Face;
