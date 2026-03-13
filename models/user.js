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

module.exports = User;