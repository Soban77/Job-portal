const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, required: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['seeker', 'employer', 'admin'], required: true },
  skills: [String],
  resumeURL: String,
  profileInfo: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;