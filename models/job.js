const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  category: String,
  skillsRequired: [String],
  postedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

const job = mongoose.model('Job',jobSchema);

module.exports = job;