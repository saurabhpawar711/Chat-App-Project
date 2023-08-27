const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/authorization');
const chatController = require('../controller/chatController');

router.post('/message/sendmessage', authenticateUser.authenticateUser, chatController.sendMessage);

module.exports = router;