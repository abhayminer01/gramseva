const mongoose = require('mongoose');

const mgnregaRequestSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  landDetails: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'forwarded', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('MgnregaRequest', mgnregaRequestSchema);
