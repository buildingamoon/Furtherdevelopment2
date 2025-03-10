// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderShow:{type: String, required: true},
  discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
