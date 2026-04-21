# SkillMatch 🎯

**A full-stack MERN platform that matches students to internships and hackathons based on their skills — using a custom weighted scoring algorithm with prerequisite-chain awareness.**

> Built as a major project to solve a real problem: students apply to the wrong opportunities because there's no smart skill-based filter.

---

## Live Demo

> Deploy to Vercel and add your URL here.

---

## What It Does

1. **Enter your skills** — React, Python, SQL, etc.
2. **Algorithm scores every opportunity** — weighted across required skills, optional skills, and prerequisite chains
3. **See ranked results** — sorted by your personal Readiness Score (0–100)
4. **Know your skill gaps** — see exactly which skills you have, which you're missing, and which nice-to-haves you match

---

## The Algorithm

The core matching engine uses a **Weighted Multi-Factor Scoring System** — not a simple percentage:

| Factor | Weight | Description |
|--------|--------|-------------|
| Required Skill Coverage | **70%** | How many required skills you have |
| Optional Skill Bonus | **20%** | Nice-to-have skills you also have |
| Prerequisite Chain Credit | **10%** | Rewards knowing a parent skill (e.g. JS → React) |

**Prerequisite chains** are the novel part — knowing JavaScript grants 35% partial credit toward React roles, because JavaScript is a prerequisite for React. A simple percentage match would give you a zero; SkillMatch doesn't.

**Skill normalisation** — 100+ alias mappings ensure `"JS"`, `"JavaScript"`, and `"javascript"` are all treated identically.

**Score legend:**
- 🟢 **≥ 70%** — Strong match
- 🟡 **40–70%** — Moderate match
- 🔴 **< 40%** — Skill gap exists

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Security | Helmet.js, Rate Limiting (100 req/15 min) |
| Deployment | Vercel (serverless) |

---

## Project Structure

```
skill-match/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # SkillInput, OpportunityCard, SkillTrends
│       ├── pages/           # App pages
│       └── App.jsx
│
├── server/                  # Node.js + Express backend
│   ├── models/              # Opportunity.js, User.js (Mongoose schemas)
│   ├── routes/              # opportunities, match, auth, users, admin
│   ├── utils/
│   │   ├── matchingAlgorithm.js   # Core weighted scoring engine
│   │   ├── skillAliases.js        # 100+ skill normalisation map
│   │   ├── externalApiService.js  # Live data fetching (Devpost, MLH, etc.)
│   │   └── mockData.js            # Fallback data if APIs are unavailable
│   ├── middleware/          # Auth middleware
│   ├── seed.js              # DB seeder for local development
│   └── server.js            # Entry point
│
├── presentation.html        # Faculty presentation (open in browser)
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/opportunities` | List active opportunities (auto-refreshes if cache stale) |
| `POST` | `/api/match` | Run scoring algorithm for a given skill set |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/users/:id` | Get user profile and saved skills |
| `POST` | `/api/opportunities/refresh` | Manually trigger external API sync |
| `GET` | `/api/health` | Server health check |

**Match request body:**
```json
{ "skills": ["react", "javascript", "python"] }
```

**Match response:**
```json
{
  "success": true,
  "count": 8,
  "data": [{
    "title": "Frontend Developer Intern",
    "company": "Infosys",
    "matchData": {
      "matchedRequired": ["react", "javascript"],
      "matchedOptional": [],
      "missingSkills": ["css"],
      "readinessScore": 72
    }
  }]
}
```

---

## Local Setup

### Prerequisites
- Node.js v16+
- MongoDB Atlas account (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/PRB18/skill_analysis.git
cd skill_analysis
```

### 2. Backend setup
```bash
cd server
cp .env.example .env
# Edit .env and add your MONGODB_URI and JWT_SECRET
npm install
npm run seed    # optional: seed with sample data
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## Environment Variables

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/skillmatch
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Set **Root Directory** → `client`, **Framework** → Vite
4. Add all environment variables from above
5. Deploy — Vercel auto-routes `/api/*` to the Express server via `vercel.json`

> **Important:** Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access (Vercel uses dynamic IPs).

---

## Key Engineering Decisions

| Problem | Solution |
|---------|----------|
| `"ML" ≠ "Machine Learning"` causing false mismatches | Built `skillAliases.js` with 100+ normalisation entries |
| Hammering external APIs on every request | 6-hour MongoDB TTL cache with background refresh |
| Duplicate records on re-seeding | `findOneAndUpdate` with `upsert: true` keyed on `applyUrl` |
| CORS mismatch between dev (5173) and prod (Vercel) | Dynamic origin allowlist + Vite proxy in development |
| Simple % match is unfair | Prerequisite chain credit — JS gives 35% credit toward React |

---

## Author

**Rishi** — [github.com/PRB18](https://github.com/PRB18) · baburishi505@gmail.com
