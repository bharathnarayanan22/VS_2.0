const express = require('express');
const router = express.Router();
const { vote, checkHasVoted, fetchVoters, deleteVoter } = require('../controllers/voterController');

router.post('/voters/vote/:partyId', vote);
router.get('/voters/has-voted/:voterId', checkHasVoted);
router.get('/voters', fetchVoters);
router.delete('/voters/:voterId', deleteVoter);

module.exports = router;
