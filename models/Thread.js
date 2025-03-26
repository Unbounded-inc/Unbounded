const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Thread', ThreadSchema);
