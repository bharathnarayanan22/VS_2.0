const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
const FaceModel = require("../model/faceModel");
const { uploadLabeledImages, getDescriptorsFromDB } = require("../utils/faceRecognition");

faceapi.env.monkeyPatch({ Canvas, Image });

async function uploadFaceData(req, res) {
  const File1 = req.files.File1.tempFilePath;
  const File2 = req.files.File2.tempFilePath;
  const File3 = req.files.File3.tempFilePath;
  const label = req.body.label;

  let result = await uploadLabeledImages([File1, File2, File3], label);

  if (result === 'Voter already enrolled') {
    return res.status(409).json({ message: "Voter already enrolled" });
  } else if (result) {
    return res.json({ message: "Face data stored successfully" });
  } else {
    return res.status(500).json({ message: "Something went wrong, please try again." });
  }
}

async function checkFace(req, res) {
  const File1 = req.files.File1.tempFilePath;
  let results = await getDescriptorsFromDB(File1);

  if (!results || results.length === 0) {
    return res.json({ hasVoted: false, validFace: false });
  }

  const bestMatch = results[0];
  const voter = await FaceModel.findOne({ label: bestMatch.label });

  if (!voter) {
    return res.json({ hasVoted: false, validFace: false });
  }

  res.json({ hasVoted: voter.hasVoted, validFace: true, faceId: voter._id });

  voter.hasVoted = true;
  await voter.save();
}

module.exports = {
  uploadFaceData,
  checkFace
};
