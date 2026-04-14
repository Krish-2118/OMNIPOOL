const express = require('express');
const router = express.Router();
const { parseProject, matchResources, getAdvice } = require('../controllers/ai.controller');
const auth = require('../middleware/auth');

router.post('/parse-project', auth, parseProject);
router.post('/match-resources', auth, matchResources);
router.post('/get-advice', auth, getAdvice);

module.exports = router;
