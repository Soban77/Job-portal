const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumeURL: String,
  coverLetter: String,
  status: { type: String, enum: ['applied', 'shortlisted', 'interview', 'rejected'], default: 'applied' },
  appliedDate: { type: Date, default: Date.now },
  interviewDate: Date
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;