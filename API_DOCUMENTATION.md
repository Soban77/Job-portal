# Job Portal API Documentation

## Overview
Complete REST API documentation for the Job Portal platform. Access interactive Swagger UI at `/api-docs`

---

## Base URL
```
Development: http://localhost:5000
Production: https://jobportal.herokuapp.com
```

## Authentication
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## API Endpoints

### Authentication Routes

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seeker" | "employer" | "admin"
}

Response: 201
{
  "message": "Registered",
  "user": { ... }
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seeker"
  }
}
```

---

### User Routes

#### Get Current User Profile
```http
GET /user/me
Authorization: Bearer <TOKEN>

Response: 200
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "seeker",
  "skills": ["JavaScript", "Python"],
  "resumeURL": "/uploads/resume.pdf",
  "profileInfo": "Experienced developer..."
}
```

#### Update User Profile
```http
PUT /user/me
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "skills": ["JavaScript", "React", "Node.js"],
  "resumeURL": "/uploads/new-resume.pdf",
  "profileInfo": "Updated profile info",
  "company": "Tech Corp" // for employers
}

Response: 200
{
  "message": "Updated",
  "user": { ... }
}
```

#### Get All Users (Admin Only)
```http
GET /user
Authorization: Bearer <ADMIN_TOKEN>

Response: 200
[
  {
    "_id": "...",
    "name": "User 1",
    "email": "user1@example.com",
    "role": "seeker"
  },
  ...
]
```

#### Delete User (Admin Only)
```http
DELETE /user/:id
Authorization: Bearer <ADMIN_TOKEN>

Response: 200
{
  "message": "User deleted successfully"
}
```

---

### Job Routes

#### Get All Jobs (with filters)
```http
GET /job?search=developer&category=IT&skills=JavaScript,Node.js&location=Karachi&jobType=Full-time&experienceLevel=Senior
Authorization: Optional

Response: 200
[
  {
    "_id": "...",
    "title": "Senior Developer",
    "description": "...",
    "category": "IT",
    "skillsRequired": ["JavaScript", "Node.js"],
    "location": "Karachi",
    "jobType": "Full-time",
    "salaryMin": 100000,
    "salaryMax": 200000,
    "experienceLevel": "Senior",
    "status": "open",
    "employerId": { ... },
    "postedDate": "2024-05-01T10:00:00Z"
  },
  ...
]
```

#### Get Job Details
```http
GET /job/:id
Authorization: Optional

Response: 200
{
  "_id": "...",
  "title": "Senior Developer",
  "description": "...",
  "category": "IT",
  "skillsRequired": ["JavaScript", "Node.js"],
  "employerId": {
    "_id": "...",
    "name": "Company Name",
    "email": "company@example.com"
  },
  ...
}
```

#### Create Job (Employer Only)
```http
POST /job
Authorization: Bearer <EMPLOYER_TOKEN>
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "We are looking for a senior developer...",
  "category": "IT",
  "skillsRequired": ["JavaScript", "Node.js", "MongoDB"],
  "location": "Karachi",
  "jobType": "Full-time",
  "salaryMin": 100000,
  "salaryMax": 200000,
  "experienceLevel": "Senior",
  "expiryDate": "2024-06-01T00:00:00Z"
}

Response: 201
{
  "message": "Successful",
  "Job": { ... }
}
```

#### Update Job (Employer Only)
```http
PUT /job/:id
Authorization: Bearer <EMPLOYER_TOKEN>
Content-Type: application/json

{
  "title": "Senior Developer (Updated)",
  "status": "closed",
  ...
}

Response: 200
{
  "message": "Job updated successfully",
  "job": { ... }
}
```

#### Delete Job (Employer Only)
```http
DELETE /job/:id
Authorization: Bearer <EMPLOYER_TOKEN>

Response: 200
{
  "message": "Job deleted successfully"
}
```

#### Get My Jobs (Employer Only)
```http
GET /job/my
Authorization: Bearer <EMPLOYER_TOKEN>

Response: 200
[
  { ... job details ... },
  ...
]
```

---

### Application Routes

#### Get Applications
```http
GET /application
Authorization: Bearer <TOKEN>

Response: 200
[
  {
    "_id": "...",
    "jobId": {
      "_id": "...",
      "title": "Senior Developer"
    },
    "seekerId": {
      "_id": "...",
      "name": "Candidate Name",
      "email": "candidate@example.com",
      "skills": ["JavaScript", "Node.js"]
    },
    "status": "pending",
    "appliedDate": "2024-05-01T10:00:00Z",
    "interviewDate": null,
    "interviewType": "phone",
    "rating": null
  },
  ...
]
```

#### Submit Application (Seeker Only)
```http
POST /application
Authorization: Bearer <SEEKER_TOKEN>
Content-Type: application/json

{
  "jobId": "..."
}

Response: 201
{
  "message": "Application submitted",
  "application": { ... }
}
```

#### Update Application Status (Employer Only)
```http
PUT /application/:id/status
Authorization: Bearer <EMPLOYER_TOKEN>
Content-Type: application/json

{
  "status": "shortlisted" | "interview" | "accepted" | "rejected",
  "interviewDate": "2024-05-10T14:00:00Z", // required if status='interview'
  "interviewType": "video" | "phone" | "inperson" | "email",
  "feedback": "Impressed with your experience..."
}

Response: 200
{
  "message": "Application status updated",
  "application": { ... }
}
```

#### Get Application Details
```http
GET /application/:id
Authorization: Bearer <TOKEN>

Response: 200
{
  ... application details ...
}
```

---

### Message Routes

#### Get Messages
```http
GET /message
Authorization: Bearer <TOKEN>

Response: 200
[
  {
    "_id": "...",
    "sender": {
      "_id": "...",
      "name": "Sender Name",
      "email": "sender@example.com"
    },
    "receiver": {
      "_id": "...",
      "name": "Receiver Name",
      "email": "receiver@example.com"
    },
    "subject": "Interview Feedback",
    "content": "Thank you for the interview...",
    "isRead": false,
    "createdAt": "2024-05-01T10:00:00Z"
  },
  ...
]
```

#### Send Message
```http
POST /message
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "recipient": "recipient@example.com",
  "subject": "Interview Feedback",
  "content": "Thank you for the interview..."
}

Response: 201
{
  "message": "Message sent successfully",
  "data": { ... }
}
```

---

### Upload Routes

#### Upload Resume
```http
POST /upload/resume
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

Body:
- file: (PDF or DOCX file, max 5MB)

Response: 200
{
  "message": "Resume uploaded successfully",
  "resumeURL": "/uploads/1234567890-resume.pdf",
  "fileName": "1234567890-resume.pdf"
}
```

#### Download Resume
```http
GET /upload/download/:filename
Authorization: Optional

Response: 200 (File stream)
```

---

### Employer Routes

#### Get All Employers (Admin Only)
```http
GET /employer
Authorization: Bearer <ADMIN_TOKEN>

Response: 200
[
  {
    "_id": "...",
    "userId": {
      "name": "Company Name",
      "email": "company@example.com"
    },
    "verified": true,
    "jobsPosted": 5
  },
  ...
]
```

#### Get Employer Profile (Self)
```http
GET /employer/me
Authorization: Bearer <EMPLOYER_TOKEN>

Response: 200
{
  "_id": "...",
  "userId": "...",
  "company": "Tech Corp",
  "website": "https://techcorp.com",
  "verified": true
}
```

#### Verify Employer (Admin Only)
```http
PUT /employer/:id/verify
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "verified": true
}

Response: 200
{
  "message": "Employer verified successfully",
  "employer": { ... }
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists (e.g., duplicate email) |
| 500 | Server Error - Internal server error |

---

## Error Response Format

```json
{
  "error": "Descriptive error message"
}
```

Example:
```json
{
  "error": "Invalid email or password"
}
```

---

## Pagination (Coming Soon)

```http
GET /job?page=1&limit=20
```

---

## Rate Limiting (Coming Soon)

- 100 requests per minute per IP
- 1000 requests per hour per user

---

## CORS

All endpoints support CORS requests from any origin (configurable).

---

## Swagger UI

Interactive API documentation available at:
```
http://localhost:5000/api-docs
```

---

## Error Handling

All errors return JSON with error message and HTTP status code:

```javascript
// Example: Invalid token
Response: 401
{
  "error": "No token provided or token invalid"
}

// Example: Not found
Response: 404
{
  "error": "Job not found"
}

// Example: Server error
Response: 500
{
  "error": "Internal server error"
}
```

---

## Rate Limiting Rules

Implemented via middleware for production:
- **Authentication endpoints:** 5 attempts per 15 minutes
- **Search endpoints:** 100 requests per minute
- **Upload endpoints:** 10 uploads per hour per user
- **Other endpoints:** 50 requests per minute

---

## Security Headers

All responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
```

---

## Testing APIs with cURL

### Login:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Get User Profile:
```bash
curl -X GET http://localhost:5000/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Jobs:
```bash
curl -X GET "http://localhost:5000/job?search=developer&category=IT"
```

### Upload Resume:
```bash
curl -X POST http://localhost:5000/upload/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@resume.pdf"
```

---

## Testing APIs with Postman

1. Import the Swagger spec from `/api-docs` into Postman
2. Set `{{token}}` environment variable after login
3. Use `{{baseUrl}}` for the base URL

---

**API Documentation Version:** 1.0
**Last Updated:** May 2, 2026
**Status:** Production Ready