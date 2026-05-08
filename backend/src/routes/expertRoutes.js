const express = require('express');
const router = express.Router();
const { getExperts, getExpertById } = require('../controllers/expertController');
const { validateExpertQuery } = require('../validators/expertValidator');

router.get('/', validateExpertQuery, getExperts);
router.get('/:id', getExpertById);

module.exports = router;
