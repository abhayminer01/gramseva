const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['ward_member', 'secretary', 'higher_authority', 'admin'],
    required: true,
  },
  district: { type: String, required: true },
  localBodyType: {
    type: String,
    enum: ['Panchayat', 'Municipality', 'Corporation', 'System'],
    required: true,
  },
  localBodyName: { type: String, required: true },
  wardNumber: { type: String },
  // Authorities inherently do not have an isApproved verification block
}, { timestamps: true });

module.exports = mongoose.model('Authority', authoritySchema);
