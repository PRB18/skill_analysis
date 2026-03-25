# SkillMatch - Skill-Based Internship & Hackathon Matchmaking Platform

A full-stack MERN application that matches users with internships and hackathons based on their skills.

## Features

- **Skill Matching Algorithm**: Calculates match percentage between user skills and opportunity requirements
- **Visual Skill Breakdown**: Shows matched required skills, missing skills, and matched optional skills
- **Readiness Score**: Color-coded progress bar showing how ready you are (Green: 70%+, Yellow: 40-70%, Red: Below 40%)
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Matching**: Instant results when you add your skills

---

## Project Structure

```
skill-match/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main application
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.js      # Vite config with proxy
│
└── server/          # Node + Express backend
    ├── models/        # MongoDB models
    ├── routes/        # API routes
    ├── utils/         # Helper functions
    ├── server.js      # Entry point
    └── seed.js        # Database seeder
```

---

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works)

---

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (free tier: M0)
3. Click "Database Access" and create a new database user with password
4. Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (for development)
5. Go to "Database" → Click "Connect" on your cluster
6. Select "Drivers" → "Node.js"
7. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` with your database user's password

---

## 2. Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file and add your MongoDB URI:
   ```env
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/skillmatch?retryWrites=true&w=majority
   PORT=5000
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Seed the database with sample opportunities:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

---

## 3. Frontend Setup

1. Open a new terminal and navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

---

## How the Matching Algorithm Works

The matching algorithm (`server/utils/matchingAlgorithm.js`) compares user skills against opportunity requirements:

### Algorithm Steps:

1. **Normalize Skills**: Converts all skills to lowercase for case-insensitive comparison

2. **Calculate Matches**:
   - `matchedRequired`: User skills that exist in requiredSkills
   - `matchedOptional`: User skills that exist in optionalSkills
   - `missingSkills`: Required skills the user doesn't have

3. **Compute Readiness Score**:
   ```
   readinessScore = (matchedRequired.length / requiredSkills.length) × 100
   ```

### Example:

User skills: `["react", "javascript", "css"]`

Opportunity:
- Required: `["react", "javascript", "typescript", "css"]`
- Optional: `["redux", "sass"]`

**Results:**
- matchedRequired: `["react", "javascript", "css"]`
- missingSkills: `["typescript"]`
- matchedOptional: `[]`
- readinessScore: **75%** (3/4 required skills)

---

## API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/opportunities` | Get all opportunities | - |
| GET | `/api/opportunities/:id` | Get single opportunity | - |
| POST | `/api/match` | Match user skills | `{ "skills": ["react", "javascript"] }` |
| POST | `/api/users` | Create new user | `{ "name": "John", "skills": ["react"] }` |
| GET | `/api/users` | Get all users | - |
| GET | `/api/health` | Health check | - |

### Match API Response:

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "title": "Frontend Developer Intern",
      "company": "Infosys",
      "type": "internship",
      "requiredSkills": ["react", "javascript", "css"],
      "optionalSkills": ["typescript", "redux"],
      "matchData": {
        "matchedRequired": ["react", "javascript"],
        "matchedOptional": [],
        "missingSkills": ["css"],
        "readinessScore": 66
      }
    }
  ]
}
```

---

## Sample Data

The seed file creates 5 opportunities:

| Title | Company | Type | Required Skills | Optional Skills |
|-------|---------|------|-----------------|-----------------|
| Frontend Developer Intern | Infosys | Internship | React, JavaScript, CSS | TypeScript, Redux |
| Backend Developer Intern | Cognizant | Internship | Node.js, MongoDB, Express | Docker, AWS |
| ML Hackathon | Google | Hackathon | Python, TensorFlow, Pandas | PyTorch, Scikit-learn |
| Full Stack Intern | TCS | Internship | React, Node.js, MongoDB, Express | Redux, Docker |
| Data Science Intern | Wipro | Internship | Python, Pandas, SQL | Tableau, PowerBI |

---

## Color Guide

| Color | Hex | Usage |
|-------|-----|-------|
| Green | `#22c55e` | Matched required skills, score ≥70% |
| Yellow | `#eab308` | Moderate match (40-70%) |
| Red | `#ef4444` | Missing skills, score <40% |
| Blue | `#3b82f6` | Matched optional skills |
| Navy BG | `#0f172a` | Page background |

---

## Technologies Used

**Frontend:**
- React 18
- Vite (build tool)
- Axios (HTTP client)

**Backend:**
- Node.js
- Express
- MongoDB (with Mongoose)

**Development:**
- Nodemon (auto-restart)
- CORS (cross-origin requests)
- dotenv (environment variables)

---

## Troubleshooting

### "MongoDB Connection Error"
- Verify your MONGODB_URI in `.env` file
- Check that your IP is whitelisted in MongoDB Atlas Network Access
- Ensure your database user password is correct

### "Cannot POST /api/match"
- Make sure backend server is running on port 5000
- Check that Vite proxy is configured in `vite.config.js`

### CORS errors
- Ensure `app.use(cors())` is in `server.js`
- Vite proxy should handle this in development

---

## License

MIT

## Author

Built for Skill-Based Internship & Hackathon Matchmaking Platform
