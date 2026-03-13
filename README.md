Job Portal (MERN Stack)

📌 Overview
A full‑stack job portal built with the MERN stack (MongoDB, Express.js, React.js, Node.js). The platform connects job seekers and employers, enabling users to register, post jobs, apply for positions, and communicate through messages. It is designed to be secure, scalable, and user‑friendly.

🚀 Features
- User Authentication: Register, login, and role‑based access (seeker/employer).
- Job Management: Employers can post, update, and delete job listings.
- Applications: Seekers can apply for jobs and track their status.
- Messaging: Direct communication between candidates and employers.
- RESTful API: Clean separation of routes, controllers, and models.

🛠 Tech Stack
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose ODM)
- Authentication: JWT
- Version Control: Git & GitHub

📂 Project Structure
project-root/
├── index.js              # Entry point
├── create.js             # All models
├── insertDummy.js        # Inserting fake/dummy data
├── connecting.js         # MongoDB connection
├── models/               # Mongoose schemas
├── routes/               # API endpoints
├── controllers/          # Business logic
├── middleware/           # Auth & error handling
├── .env                  # Environment variables
└── .gitignore            # Ignore node_modules, .env, etc.
