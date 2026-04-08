const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'citizen' },
  rationCardNumber: { type: String },
  district: { type: String, required: true },
  localBodyType: {
    type: String,
    enum: ['Panchayat', 'Municipality', 'Corporation'],
    required: true,
  },
  localBodyName: { type: String, required: true },
  wardNumber: { type: String },
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Citizen', citizenSchema);
