const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: String, // Optional: for group chats
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
