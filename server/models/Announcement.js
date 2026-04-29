const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['announcement', 'notification'],
    default: 'announcement',
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  localBody: { type: String, required: true },
  targetAudience: { 
    type: String, // e.g. "all", or specific ward number
    default: 'all' 
  },
  createdAt: { type: Date, expires: '10d', default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
