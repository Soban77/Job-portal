const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: String,
  companyProfile: String,
  verificationStatus: { type: Boolean, default: false }
});

const Employer = mongoose.model('Employer', employerSchema);

module.exports = Employer;