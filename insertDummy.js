const {User,job,Application,Employer,Message} = require('./create.js');
const connect = require('./connecting.js');
const mongoose = require('mongoose');

connect();

async function seed() {
  
  try {
    // Create a User
    const user = new User({
      name: "Ali Khan",
      email: "ali.khan@example.com",
      passwordHash: "hashedpassword123",
      role: "seeker",
      skills: ["JavaScript", "React", "Node.js"],
      resumeURL: "/uploads/resumes/ali_resume.pdf",
      profileInfo: "Fresh graduate looking for frontend developer roles."
    });
    await user.save();

    // Create a Job
    const Job = new job({
      employerId: user._id,
      title: "Frontend Developer",
      description: "We are hiring a frontend developer with React experience.",
      category: "IT",
      skillsRequired: ["React", "CSS", "JavaScript"],
      location: "Karachi, Pakistan",
      salaryRange: "60,000 - 80,000 PKR",
      postedDate: new Date(),
      expiryDate: new Date(Date.now() + 30*24*60*60*1000), // 30 days later
      status: "open"
    });
    await Job.save();

    // Create an Application
    const application = new Application({
      jobId: job._id,
      seekerId: user._id,
      resumeURL: "/uploads/resumes/ali_resume.pdf",
      coverLetter: "I am excited to apply for this role.",
      status: "applied",
      appliedDate: new Date()
    });
    await application.save();

    // Create an Employer
    const employer = new Employer({
      userId: user._id,
      companyName: "Tech Solutions Pvt Ltd",
      companyProfile: "A growing IT company specializing in web applications.",
      verificationStatus: true
    });
    await employer.save();

    // Create a Message
    const message = new Message({
      senderId: user._id,
      receiverId: employer._id,
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