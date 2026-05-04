# Database Schema Documentation - Job Portal

## Overview
This document provides a complete specification of the MongoDB database schema for the Job Portal platform, including collections, fields, indexes, and relationships.

---

## Collections

### 1. Users Collection

**Purpose:** Store all user accounts (seekers, employers, admins)

**Schema:**
```javascript
{
  _id: ObjectId (Primary Key),
  name: String (Required),
  email: String (Required, Unique),
  password: String (Required, Hashed with bcryptjs),
  role: String (Enum: 'seeker', 'employer', 'admin', Required),
  
  // Job Seeker Fields
  skills: [String] (Array of skills),
  resumeURL: String (Path to uploaded resume),
  profileInfo: String (Profile summary/bio),
  
  // Employer Fields
  company: String (Company name),
  website: String (Company website URL),
  verified: Boolean (Admin verification status, default: false),
  
  // Common Fields
  createdAt: Date (Default: Current timestamp),
  updatedAt: Date (Default: Current timestamp),
  isActive: Boolean (Default: true)
}
```

**Indexes:**
```javascript
// Unique email index
db.users.createIndex({ email: 1 }, { unique: true })

// Role-based filtering
db.users.createIndex({ role: 1 })

// Active users lookup
db.users.createIndex({ isActive: 1 })

// Compound index for queries
db.users.createIndex({ role: 1, createdAt: -1 })
```

**Constraints:**
- Email must be unique across all users
- Password is hashed using bcryptjs with 10 salt rounds
- Role field controls access and feature availability
- isActive flag for soft deletes

---

### 2. Jobs Collection

**Purpose:** Store job postings from employers

**Schema:**
```javascript
{
  _id: ObjectId (Primary Key),
  employerId: ObjectId (Reference to User, Required),
  title: String (Required),
  description: String (Required),
  category: String (Job category, Required),
  skillsRequired: [String] (Array of required skills),
  
  // Enhanced Fields (Added in v1.1)
  location: String (Job location/city),
  jobType: String (Enum: 'Full-time', 'Part-time', 'Contract', 'Temporary', 'Remote', Default: 'Full-time'),
  salaryMin: Number (Minimum salary),
  salaryMax: Number (Maximum salary),
  experienceLevel: String (Enum: 'Entry-level', 'Junior', 'Mid-level', 'Senior', 'Lead', Default: 'Entry-level'),
  
  // Status Fields
  status: String (Enum: 'open', 'closed', Default: 'open'),
  postedDate: Date (Default: Current timestamp),
  expiryDate: Date (Optional),
  updatedAt: Date (Default: Current timestamp)
}
```

**Indexes:**
```javascript
// Full-text search on title, description, category
db.jobs.createIndex({ title: "text", description: "text", category: "text" })

// Filter by location, jobType, experienceLevel
db.jobs.createIndex({ location: 1, jobType: 1, experienceLevel: 1, category: 1 })

// Employer lookup
db.jobs.createIndex({ employerId: 1 })

// Status filtering
db.jobs.createIndex({ status: 1 })

// Date sorting
db.jobs.createIndex({ postedDate: -1 })

// Expiry date for cleanup
db.jobs.createIndex({ expiryDate: 1 })
```

**Constraints:**
- employerId must reference valid User document
- title and description are required
- status field determines if job is accepting applications
- postedDate is immutable after creation

---

### 3. Applications Collection

**Purpose:** Store job applications from seekers to jobs

**Schema:**
```javascript
{
  _id: ObjectId (Primary Key),
  jobId: ObjectId (Reference to Job, Required),
  seekerId: ObjectId (Reference to User/Seeker, Required),
  resumeURL: String (Path to resume used for application),
  
  // Status Tracking
  status: String (Enum: 'pending', 'shortlisted', 'interview', 'accepted', 'rejected', Default: 'pending'),
  appliedDate: Date (Default: Current timestamp),
  
  // Interview Details
  interviewDate: Date (Optional, Interview scheduled date/time),
  interviewType: String (Enum: 'phone', 'video', 'inperson', 'email'),
  interviewNotes: String (Notes about the interview),
  
  // Additional Fields
  notes: String (Application notes or cover letter),
  rating: Number (Min: 1, Max: 5, Optional),
  feedback: String (Feedback from employer),
  
  // Timestamps
  updatedAt: Date (Default: Current timestamp)
}
```

**Indexes:**
```javascript
// Prevent duplicate applications
db.applications.createIndex({ jobId: 1, seekerId: 1 }, { unique: true })

// Seeker applications lookup
db.applications.createIndex({ seekerId: 1, status: 1 })

// Employer applications lookup
db.applications.createIndex({ jobId: 1, status: 1 })

// Status-based queries
db.applications.createIndex({ status: 1, appliedDate: -1 })

// Interview scheduling
db.applications.createIndex({ interviewDate: 1, status: 1 })
```

**Constraints:**
- Composite unique index prevents duplicate applications
- jobId and seekerId must reference valid documents
- status field drives workflow
- interviewDate is only set after status changes to 'interview'

---

### 4. Messages Collection

**Purpose:** Store messages between seekers and employers

**Schema:**
```javascript
{
  _id: ObjectId (Primary Key),
  senderId: ObjectId (Reference to User, Required),
  receiverId: ObjectId (Reference to User, Required),
  
  // Message Content
  subject: String (Message subject),
  content: String (Message body, Required),
  
  // Status
  isRead: Boolean (Default: false),
  readDate: Date (Optional, When message was read),
  
  // Metadata
  createdAt: Date (Default: Current timestamp),
  updatedAt: Date (Default: Current timestamp),
  
  // Optional: Thread support
  parentMessageId: ObjectId (Reference to parent message for threading)
}
```

**Indexes:**
```javascript
// Inbox queries
db.messages.createIndex({ receiverId: 1, createdAt: -1 })

// Sent messages
db.messages.createIndex({ senderId: 1, createdAt: -1 })

// Unread messages
db.messages.createIndex({ receiverId: 1, isRead: 1 })

// Message threads
db.messages.createIndex({ parentMessageId: 1 })

// Conversation lookup
db.messages.createIndex({ senderId: 1, receiverId: 1, createdAt: -1 })
```

**Constraints:**
- senderId and receiverId must reference different users
- content field is immutable after creation
- isRead can be updated but not deleted
- Conversation history maintained indefinitely

---

### 5. Employer Profiles Collection (Optional)

**Purpose:** Extended employer information

**Schema:**
```javascript
{
  _id: ObjectId (Primary Key),
  userId: ObjectId (Reference to User/Employer, Required, Unique),
  company: String (Company name),
  industry: String (Industry sector),
  description: String (Company description),
  website: String (Company website),
  logo: String (Logo URL),
  
  // Contact Information
  phone: String,
  address: String,
  city: String,
  country: String,
  
  // Statistics
  jobsPosted: Number (Total jobs posted, Default: 0),
  applicationsReceived: Number (Total applications, Default: 0),
  verified: Boolean (Admin verification, Default: false),
  rating: Number (Employer rating, 1-5),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
// User lookup
db.employer_profiles.createIndex({ userId: 1 }, { unique: true })

// Verified employers
db.employer_profiles.createIndex({ verified: 1 })

// Search by company
db.employer_profiles.createIndex({ company: "text" })
```

---

## Relationships (Entity Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                        Users                              │
│  (seekers, employers, admins)                            │
└──────────────┬──────────────────────────────┬────────────┘
               │                              │
               │ (1:N)                        │ (1:N)
               │                              │
        ┌──────▼────────┐          ┌─────────▼──────┐
        │     Jobs      │          │  Applications  │
        │               │          │                │
        │  employerId ──┼──1       │  jobId ────────┼──1
        │               │   N      │  seekerId ─────┼─→Users
        │ (1:N)         │          │                │
        └──────────────┬┘          └────────────────┘
                       │
                       │
        ┌──────────────▼────────┐
        │   Messages            │
        │                       │
        │ senderId ─────────────┼──→Users
        │ receiverId ────────────┼──→Users
        └──────────────────────┘
```

---

## Data Flow & Relationships

### Job Application Workflow:
1. **User** (Seeker) creates account
2. **Employer** posts **Job**
3. **Seeker** applies for **Job** → creates **Application**
4. **Employer** and **Seeker** exchange **Messages**
5. **Employer** updates **Application** status
6. If status = 'interview' → **interviewDate** is set

### Query Patterns:

**Find jobs for seeker:**
```javascript
db.jobs.find({
  status: 'open',
  $or: [
    { skillsRequired: { $in: userSkills } },
    { category: userCategory }
  ]
})
```

**Find applications for employer:**
```javascript
db.applications.aggregate([
  { $match: { jobId: ObjectId(jobId) } },
  { $lookup: {
      from: "users",
      localField: "seekerId",
      foreignField: "_id",
      as: "seeker"
    }
  }
])
```

**Get conversations:**
```javascript
db.messages.aggregate([
  { $match: {
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }
  },
  { $sort: { createdAt: -1 } }
])
```

---

## Indexing Strategy

### Performance Indexes:
- **Primary Keys:** Automatic by MongoDB
- **Foreign Keys:** Create for joins and lookups
- **Search Fields:** Text indexes for full-text search
- **Filter Fields:** Single-field indexes for WHERE clauses
- **Sort Fields:** Indexes on date/numeric fields used in ORDER BY
- **Compound Indexes:** Multi-field for complex queries

### Index Maintenance:
- Monitor index size
- Drop unused indexes
- Rebuild indexes periodically
- Use explain() to verify index usage

---

## Backup & Recovery Strategy

### Backup Schedule:
- Daily incremental backups
- Weekly full backups
- Monthly archive backups

### Restore Points:
- Point-in-time recovery available
- Tested restore procedures
- Disaster recovery plan

---

## Data Validation Rules

### Users:
- Email format validation (RFC 5322)
- Password minimum 8 characters
- Name 2-100 characters
- Role must be one of: seeker, employer, admin

### Jobs:
- Title: 5-200 characters
- Description: 50-5000 characters
- Skills: 1-20 skills max
- Salary: salaryMax > salaryMin

### Applications:
- Unique constraint on (jobId, seekerId)
- Status must be valid enum value
- interviewDate > appliedDate

### Messages:
- Content: 1-10000 characters
- senderId ≠ receiverId
- Both IDs must reference valid users

---

**Document Version:** 1.0
**Last Updated:** May 2, 2026
**Status:** Production Ready