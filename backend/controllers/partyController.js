const PartyModel = require("../model/partyModel");

const getParties = async(req, res) => {
  try {
    const parties = await PartyModel.find();
    res.json({ parties });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const enrollParty = async(req, res)=> {
  try {
    const { partyName, partyLeader, partySymbol } = req.body;

    // Check if the party name, leader, or symbol already exists (case-insensitive)
    const existingParty = await PartyModel.findOne({
      $or: [
        { partyName: { $regex: new RegExp(`^${partyName}$`, 'i') } },
        { partyLeader: { $regex: new RegExp(`^${partyLeader}$`, 'i') } },
        { partySymbol: { $regex: new RegExp(`^${partySymbol}$`, 'i') } },
      ],
    });

    if (existingParty) {
      return res.status(409).json({ message: 'Party already enrolled.' });
    }

    // Create a new party enrollment document
    const newParty = new PartyModel({
      partyName,
      partyLeader,
      partySymbol,
    });

    // Save the new party enrollment document to the database
    await newParty.save();

    res.json({ message: "Party enrolled successfully" });
  } catch (error) {
    console.error("Error enrolling party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateParty = async(req, res) => {
  const { id } = req.params;
  const { partyName, partyLeader, partySymbol } = req.body;

  try {
    // Check if the new party name, leader, or symbol already exists (case-insensitive)
    const existingParty = await PartyModel.findOne({
      $or: [
        { partyName: { $regex: new RegExp(`^${partyName}$`, 'i') } },
        { partyLeader: { $regex: new RegExp(`^${partyLeader}$`, 'i') } },
        { partySymbol: { $regex: new RegExp(`^${partySymbol}$`, 'i') } },
      ],
      _id: { $ne: id } // Exclude the current party being updated
    });

    if (existingParty) {
      return res.status(409).json({ message: 'Party already enrolled.' });
    }

    // Find the party by ID and update its details
    const updatedParty = await PartyModel.findByIdAndUpdate(id, {
      partyName,
      partyLeader,
      partySymbol
    }, { new: true }); // Set { new: true } to return the updated party document

    if (updatedParty) {
      res.status(200).json({ message: "Party updated successfully", party: updatedParty });
    } else {
      res.status(404).json({ message: "Party not found" });
    }
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteParty = async(req, res) => {
  const partyId = req.params.partyId;
  try {
    await PartyModel.findByIdAndDelete(partyId);
    res.status(200).json({ message: "Party deleted successfully" });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const viewResults = async(req, res) => {
  try {
    const parties = await PartyModel.find({}).sort({ VoteCount: -1 });
    res.json({ parties });
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ message: 'Error fetching parties' });
  }
}

module.exports = {
  getParties,
  enrollParty,
  updateParty,
  deleteParty,
  viewResults
};
