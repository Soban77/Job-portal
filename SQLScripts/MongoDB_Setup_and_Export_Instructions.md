# MongoDB Setup and Backup Instructions

## Note
This project uses MongoDB as its database system. The repository does not use an SQL relational database, so the provided instructions describe how to initialize, backup, and export the MongoDB data schema.

## Database Initialization

The backend uses Mongoose schema definitions in the repository to model the data. Key collections are:
- `users`
- `jobs`
- `applications`
- `employers`
- `messages`

The `create.js` file includes the Mongoose schemas for these collections.

## Recommended Setup Commands

```bash
# Start MongoDB server locally
mongod --dbpath "C:/data/db"

# Create the database and add initial documents using an application script or manual insert
node index.js
```

## Exporting Data and Backup

### 1. Export Collections to JSON

```bash
mongoexport --db=job_portal --collection=users --out=users.json
mongoexport --db=job_portal --collection=jobs --out=jobs.json
mongoexport --db=job_portal --collection=applications --out=applications.json
mongoexport --db=job_portal --collection=employers --out=employers.json
mongoexport --db=job_portal --collection=messages --out=messages.json
```

### 2. Create a Database Dump

```bash
mongodump --db=job_portal --out=./mongo_backup
```

### 3. Restore from Backup

```bash
mongorestore --db=job_portal_restored ./mongo_backup/job_portal
```

## Schema Documentation

Detailed collection and field descriptions are available in `DATABASE_SCHEMA_DOCUMENTATION.md`.

## How to Use These Files in Submission

Place this file inside the `SQLScripts` folder in the final zip package. It documents the database backup process and provides a clear alternative for NoSQL database submission requirements.
