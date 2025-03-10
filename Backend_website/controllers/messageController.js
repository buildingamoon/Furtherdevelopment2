const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');
const mongoose = require('mongoose');

const createMessage = async (req, res) => {
  try {
    // Check if a similar message already exists
    const existingMessage = await Message.findOne({ 
      text: req.body.text,
      sender: req.body.sender,
      discussionId: req.body.discussionId,
      timestamp: req.body.timestamp 
    });

    if (existingMessage) {
      return res.status(httpStatus.CONFLICT).json({ message: 'Duplicate message detected' });
    }

    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(httpStatus.CREATED).json(savedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};


const getMessagesByDiscussionId = async (req, res) => {
  const { discussionId } = req.params;
  console.log(`Fetching messages for discussionId: ${discussionId}`); // Add logging
  if (!mongoose.Types.ObjectId.isValid(discussionId)) {
    return res.status(400).json({ message: 'Invalid discussion ID' });
  }
  try {
    const messages = await Message.find({ discussionId });
    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found for this discussion' });
    }
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

const updateMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
    }
    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message
    });
  }
};

module.exports = {
  createMessage,
  getMessagesByDiscussionId,
  updateMessage,
  deleteMessage
};
