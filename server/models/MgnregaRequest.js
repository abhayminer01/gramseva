const mongoose = require('mongoose');

const mgnregaRequestSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  district: { type: String, required: true },
  localBodyType: { type: String, required: true },
  localBodyName: { type: String, required: true },
  wardNumber: { type: String },
  status: {
    type: String,
    enum: ['pending', 'forwarded', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Authority' },
}, { timestamps: true });

module.exports = mongoose.model('MgnregaRequest', mgnregaRequestSchema);
