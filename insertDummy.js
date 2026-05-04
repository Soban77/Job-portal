require('dotenv').config();
const bcrypt = require('bcryptjs');
const connect = require('./connecting.js');
const mongoose = require('mongoose');
const User = require('./models/user');
const Job = require('./models/job');
const Application = require('./models/application');
const Employer = require('./models/employer');
const Message = require('./models/message');

async function seed() {
  
  try {
    await connect();

    // Create a User
    const seeker = new User({
      name: "Ali Khan",
      email: "ali.khan@example.com",
      password: "pass1234",
      role: "seeker",
      skills: ["JavaScript", "React", "Node.js"],
      resumeURL: "/uploads/resumes/ali_resume.pdf",
      profileInfo: "Fresh graduate looking for frontend developer roles."
    });
    await seeker.save();

    const employerUser = new User({
      name: "Tech Solutions HR",
      email: "hr@techsolutions.com",
      password: "pass1234",
      role: "employer"
    });
    await employerUser.save();

    // Create a Job
    const job = new Job({
      employerId: employerUser._id,
      title: "Frontend Developer",
      description: "We are hiring a frontend developer with React experience.",
      category: "IT",
      skillsRequired: ["React", "CSS", "JavaScript"],
      postedDate: new Date(),
      expiryDate: new Date(Date.now() + 30*24*60*60*1000), // 30 days later
      status: "open"
    });
    await job.save();

    // Create an Application
    const application = new Application({
      jobId: job._id,
      seekerId: seeker._id,
      resumeURL: "/uploads/resumes/ali_resume.pdf",
      coverLetter: "I am excited to apply for this role.",
      status: "applied",
      appliedDate: new Date()
    });
    await application.save();

    // Create an Employer
    const employer = new Employer({
      userId: employerUser._id,
      companyName: "Tech Solutions Pvt Ltd",
      companyProfile: "A growing IT company specializing in web applications.",
      verificationStatus: true
    });
    await employer.save();

    // Create a Message
    const message = new Message({
      senderId: seeker._id,
      receiverId: employerUser._id,
      jobId: job._id,
      messageText: "Hello, I would like to know more about the interview process.",
      timestamp: new Date()
    });
    await message.save();

    console.log('🌱 Seed data inserted successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  }
}

seed();