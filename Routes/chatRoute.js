const express = require('express');
const router = express.Router();

const authenticateUser = require('../middleware/authorization');
const chatController = require('../controller/chatController');

router.post('/message/sendmessage', authenticateUser.authenticateUser, chatController.sendMessage);

// router.get('/message/getmessages/:id', authenticateUser.authenticateUser, chatController.getMessages);

module.exports = router;