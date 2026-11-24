# Teacher Booking API

A RESTful backend application for managing teachers, users and session bookings, built using **Node.js, TypeScript, Express.js, MongoDB and Mongoose**.

## Tech Stack

- Node.js 18+
- TypeScript
- Express.js
- MongoDB
- Mongoose
- Nodemon
- ts-node
- Postman

## Features

- Create and manage users.
- Create and manage teachers.
- Create sessions for teachers.
- Retrieve available sessions by date.
- Book available sessions for users.
- Prevent duplicate session bookings.
- Mark booked sessions as completed.
- Retrieve user session history.
- Separate upcoming and completed sessions.
- Pagination for user listing.
- Centralized error handling.
- MongoDB aggregation pipelines for session queries.

## Project Structure

```text
teacher-booking-api/
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── userController.ts
│   │   ├── teacherController.ts
│   │   └── sessionController.ts
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Teacher.ts
│   │   └── Session.ts
│   │
│   ├── routes/
│   │   ├── userRoutes.ts
│   │   ├── teacherRoutes.ts
│   │   └── sessionRoutes.ts
│   │
│   ├── services/
│   │   ├── userService.ts
│   │   └── sessionService.ts
│   │
│   ├── utils/
│   │   └── AppError.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── postman/
│   └── Teacher-Booking-API.postman_collection.json
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

Make sure the following are installed:

- Node.js 18 or above
- npm
- MongoDB (local installation or MongoDB Atlas)
- Postman (for API testing)

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd teacher-booking-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your environment file:

```bash
cp .env.example .env
```

Update `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/teacher_booking
```

For MongoDB Atlas, replace the connection string with your Atlas connection URL.

### 4. Start development server

```bash
npm run dev
```

Expected output:

```text
MongoDB connected
API running on port 3000
```

Base URL:

```text
http://localhost:3000
```

### 5. Build and run production

Compile TypeScript:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

## NPM Scripts

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server with Nodemon |
| `npm run build` | Compile TypeScript into JavaScript |
| `npm start` | Start production server from dist |

## Database Schemas

### User

| Field | Type | Description |
|---|---|---|
| fullName | String | User's full name |
| email | String | Unique email address |
| phone | String | Contact number |
| timestamps | Date | Created and updated dates |

### Teacher

| Field | Type | Description |
|---|---|---|
| fullName | String | Teacher's full name |
| email | String | Unique email address |
| specialization | String | Subject specialization |
| experience | Number | Years of experience |
| timestamps | Date | Created and updated dates |

### Session

| Field | Type | Description |
|---|---|---|
| teacherId | ObjectId | Reference to Teacher |
| userId | ObjectId / null | Reference to User |
| startTime | Date | Session start time |
| endTime | Date | Session end time |
| status | String | AVAILABLE / BOOKED / COMPLETED |
| completedAt | Date / null | Session completion timestamp |
| timestamps | Date | Created and updated dates |

## API Documentation

### 1. Create User

**POST** `/users`

Creates a new user.

Request body:

```json
{
  "fullName": "Aman Chaudhary",
  "email": "aman@example.com",
  "phone": "9876543210"
}
```

Response: `201 Created`

### 2. Get All Users

**GET** `/users`

Retrieves all registered users with pagination.

Query parameters:

| Parameter | Description | Default |
|---|---|---|
| page | Page number | 1 |
| limit | Records per page | 10 |

Example:

```http
GET /users?page=1&limit=10
```

Response:

```json
{
  "message": "Users fetched successfully",
  "data": [],
  "pagination": {
    "totalUsers": 25,
    "currentPage": 1,
    "totalPages": 3,
    "limit": 10
  }
}
```

### 3. Create Teacher

**POST** `/teachers`

Creates a new teacher.

Request body:

```json
{
  "fullName": "John Smith",
  "email": "john@example.com",
  "specialization": "Mathematics",
  "experience": 5
}
```

Response: `201 Created`

### 4. Create Session

**POST** `/sessions`

Creates an available session for an existing teacher.

Request body:

```json
{
  "teacherId": "TEACHER_OBJECT_ID",
  "startTime": "2026-12-01T10:00:00.000Z",
  "endTime": "2026-12-01T11:00:00.000Z"
}
```

Business validations:

- Teacher must exist.
- Both startTime and endTime are required.
- endTime must be greater than startTime.
- Default session status is AVAILABLE.

Response: `201 Created`

### 5. Get Available Sessions

**GET** `/sessions/available`

Retrieves all available sessions for a supplied date.

Query parameter:

| Parameter | Description |
|---|---|
| dateTimestamp | Unix timestamp in milliseconds |

Example:

```http
GET /sessions/available?dateTimestamp=1796121600000
```

Implementation:

This API uses MongoDB Aggregation Pipeline.

Aggregation stages:

- `$match` – Filters AVAILABLE sessions for the requested date.
- `$lookup` – Joins teacher information.
- `$unwind` – Extracts teacher details.
- `$sort` – Sorts sessions by startTime.
- `$project` – Returns the required fields.

### 6. Book Session

**POST** `/sessions/:id/book`

Books an available session for an existing user.

Example:

```http
POST /sessions/SESSION_OBJECT_ID/book
```

Request body:

```json
{
  "userId": "USER_OBJECT_ID"
}
```

Business validations:

- User must exist.
- Session must exist.
- Only AVAILABLE sessions can be booked.
- A session cannot be booked more than once.
- Session status changes to BOOKED.
- userId is associated with the session.

Response: `200 OK`

### 7. Mark Session Complete

**PATCH** `/sessions/:id/complete`

Marks a booked session as completed.

Example:

```http
PATCH /sessions/SESSION_OBJECT_ID/complete
```

Business validations:

- Session must exist.
- Only BOOKED sessions can be completed.
- Session status changes to COMPLETED.
- completedAt is updated with the current timestamp.

Response: `200 OK`

### 8. Get User Session History

**GET** `/users/:id/sessions`

Retrieves all sessions associated with a particular user, separated into upcoming and completed sessions.

Example:

```http
GET /users/USER_OBJECT_ID/sessions
```

Response structure:

```json
{
  "upcomingSessions": [],
  "completedSessions": []
}
```

Implementation:

This API uses MongoDB Aggregation Pipeline.

Aggregation stages:

- `$match` – Filters sessions by userId.
- `$lookup` – Joins teacher details.
- `$unwind` – Extracts teacher information.
- `$sort` – Sorts sessions by startTime.
- `$project` – Selects required response fields.

The application separates BOOKED upcoming sessions from COMPLETED sessions.

## Session Booking Workflow

The session follows these status transitions:

```text
       Create Session
             |
             v
         AVAILABLE
             |
             | User books session
             v
           BOOKED
             |
             | Mark session complete
             v
         COMPLETED
```

A session cannot be booked again once its status changes from AVAILABLE.

## Booking Concurrency

To prevent multiple users from booking the same session simultaneously, the booking API uses a conditional atomic MongoDB update.

```typescript
Session.findOneAndUpdate(
  {
    _id: sessionId,
    status: "AVAILABLE",
    userId: null
  },
  {
    $set: {
      status: "BOOKED",
      userId: userId
    }
  },
  {
    new: true
  }
);
```

This ensures that only one request can successfully book an available session.

## Error Handling

The application uses centralized error-handling middleware.

| HTTP Status | Description |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Invalid request or validation error |
| 404 | Resource not found |
| 409 | Duplicate email or booking conflict |
| 500 | Internal server error |

## Postman Collection

A Postman collection is included in the `postman` directory.

Import:

```text
postman/Teacher-Booking-API.postman_collection.json
```

Configure the base URL:

```text
http://localhost:3000
```

Recommended testing sequence:

1. Create a user.
2. Create a teacher.
3. Create a session using the teacher ID.
4. Retrieve available sessions.
5. Book a session using the user ID.
6. Try booking the same session again to verify duplicate booking prevention.
7. Mark the session as completed.
8. Retrieve the user's session history.
9. Retrieve all users with pagination.

## Assumptions & Design Decisions

- Teachers are stored in the database and can be created through the additional Create Teacher API.
- A session belongs to one teacher.
- A session can be booked by only one user.
- Session status defaults to AVAILABLE.
- Only BOOKED sessions can be marked COMPLETED.
- Upcoming sessions are BOOKED sessions whose startTime has not passed.
- Completed sessions are identified by COMPLETED status.
- Timestamps are stored as MongoDB Date values.
- The available sessions API interprets the supplied timestamp using the server's local calendar day.

## Author

Developed as part of a Backend Developer Assignment using Node.js, TypeScript, Express.js, MongoDB and Mongoose.
