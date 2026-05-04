const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  category: String,
  skillsRequired: [String],
  location: String,
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Remote'], default: 'Full-time' },
  salaryMin: Number,
  salaryMax: Number,
  experienceLevel: { type: String, enum: ['Entry-level', 'Junior', 'Mid-level', 'Senior', 'Lead'], default: 'Entry-level' },
  postedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

// Create text index for full-text search
jobSchema.index({ title: 'text', description: 'text', category: 'text' });
jobSchema.index({ location: 1, jobType: 1, experienceLevel: 1, category: 1 });

const job = mongoose.model('Job',jobSchema);

module.exports = job;