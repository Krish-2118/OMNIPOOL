const express = require('express');
const router = express.Router();
const { getMessages, getConversations } = require('../controllers/chat.controller');
const auth = require('../middleware/auth');

router.get('/conversations', auth, getConversations);
router.get('/:requestId', auth, getMessages);

module.exports = router;
