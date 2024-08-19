// const mongoose = require("mongoose");

// const faceSchema = new mongoose.Schema({
//   label: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   hasVoted: {
//     type: Boolean,
//     default: false,
//   },
//   imagePaths: {
//     type: [String],  
//     default: [],
//   },
// });
// const Face = mongoose.model("Face", faceSchema);

// module.exports = Face;


const mongoose = require("mongoose");

const faceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/, 
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
