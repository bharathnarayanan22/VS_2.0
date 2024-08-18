const mongoose = require("mongoose");

const partySchema = new mongoose.Schema({
  partyName: {
    type: String,
    required: true,
    unique: true, // Ensure uniqueness
  },
  partyLeader: {
    type: String,
    required: true,
    unique: true, // Ensure uniqueness
  },
  partySymbol: {
    type: String,
    required: true,
  },
  VoteCount: { 
    type: Number, 
    default: 0 
  },
});

// Define compound index
partySchema.index({ partyName: 1, partyLeader: 1 }, { unique: true });

const Party = mongoose.model('Party', partySchema);

module.exports = Party;
