const FaceModel = require("../model/faceModel");
const PartyModel = require("../model/partyModel");

const vote = async(req, res) => {
  const { partyId } = req.params;
  try {
    const party = await PartyModel.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    party.VoteCount += 1;
    await party.save();
    res.json(party);
  } catch (error) {
    console.error('Error updating vote count:', error);
    res.status(500).json({ message: 'Error updating vote count' });
  }
}

const checkHasVoted = async(req, res) => {
  const { voterId } = req.params;

  try {
    const voter = await FaceModel.findById(voterId);

    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    res.json({ hasVoted: voter.hasVoted });
  } catch (error) {
    console.error('Error checking voting status:', error);
    res.status(500).json({ message: 'Error checking voting status' });
  }
}

const fetchVoters = async(req, res) => {
  try {
    const voters = await FaceModel.find();
    res.json({ voters });
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const deleteVoter = async(req, res) => {
  const voterId = req.params.voterId;
  try {
    await FaceModel.findByIdAndDelete(voterId);
    res.status(200).json({ message: "Voter deleted successfully" });
  } catch (error) {
    console.error("Error deleting voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  vote,
  checkHasVoted,
  fetchVoters,
  deleteVoter
};
