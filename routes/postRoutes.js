const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const chatController = require('../controllers/chat');
const authSchema = require('../validators/authValidator');
const validate = require('../middleware/validator');
const authenticate = require('../middleware/authentication');

// Auth routes
router.post('/auth/register', validate(authSchema.register), authController.register);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/login', validate(authSchema.login), authController.login);

// Chat routes
router.post('/chat/add-chat-user', authenticate, chatController.addChatUser);

module.exports = router;