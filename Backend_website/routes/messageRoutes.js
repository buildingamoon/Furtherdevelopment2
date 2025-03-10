const express = require('express');
const messageController = require('../controllers/messageController');
const router = express.Router();

router.post('/', messageController.createMessage);
router.get('/discussion/:discussionId', messageController.getMessagesByDiscussionId); // Ensure parameter name matches
router.put('/:id', messageController.updateMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
