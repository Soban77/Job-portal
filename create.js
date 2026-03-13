const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['seeker', 'employer', 'admin'], required: true },
  skills: [String],
  resumeURL: String,
  profileInfo: String
});

const User = mongoose.model('User', userSchema);

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

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: String,
  companyProfile: String,
  verificationStatus: { type: Boolean, default: false }
});

const Employer = mongoose.model('Employer', employerSchema);

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  messageText: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = {
  User,
  job,
  Application,
  Employer,
  Message
};