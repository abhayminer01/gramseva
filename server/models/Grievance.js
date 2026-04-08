const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  category: {
    type: String,
    enum: ['water', 'road', 'electricity', 'waste', 'other'],
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  district: { type: String, required: true }, // District boundary
  localBody: { type: String, required: true }, // Local body name
  ward: { type: String }, // Ward number
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'resolved', 'escalated'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' }],
  deadline: { type: Date },
  escalatedToHigher: { type: Boolean, default: false },
  actionReason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Grievance', grievanceSchema);
