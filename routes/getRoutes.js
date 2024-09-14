const express = require('express');
const authenticate = require('../middleware/authentication');
const chatController = require('../controllers/chat');
const router = express.Router();

// Chat routes
router.get('/chat/get-chat-list', authenticate, chatController.getChatList);

module.exports = router;