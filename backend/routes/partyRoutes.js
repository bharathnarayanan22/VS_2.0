const express = require('express');
const router = express.Router();
const { getParties,enrollParty, updateParty, deleteParty, viewResults } = require('../controllers/partyController');

router.get('/parties',getParties);
router.post('/enroll-party', enrollParty);
router.put('/:id', updateParty);
router.delete('/parties/:partyId', deleteParty);
router.get('/parties/ViewResults', viewResults);

module.exports = router;
