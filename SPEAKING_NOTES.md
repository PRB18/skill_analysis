# SkillMatch — Speaking Notes for Faculty Panel

Use these bullet points as your talking guide. Speak naturally — don't read them verbatim.

---

## Slide 1 — Title
> "Good [morning/afternoon]. Our project is called **SkillMatch** — a full-stack web platform that intelligently matches students with internships and hackathons based on their skill set. It's built on the MERN stack — MongoDB, Express, React, and Node.js — and is deployed on Vercel."

---

## Slide 2 — The Problem
> "The problem we are solving is very real for students today. There are hundreds of internships and hackathons listed online, but there is no smart filter. Students apply to roles they are under-qualified for and get rejected, without understanding why. Worse, there is no feedback to tell you *what skills you are missing*. We built SkillMatch to solve exactly this."

---

## Slide 3 — The Solution
> "SkillMatch works in four steps. First, the student enters their skills — for example, React, Python, SQL. Then our algorithm scores them against every opportunity in the database. The results are ranked by a personal **Readiness Score** — so the best-fit opportunities appear at the top. Most importantly, the student can clearly see which skills they matched and which ones they're still missing."

---

## Slide 4 — The Algorithm
> "This is the core technical contribution of our project. We designed a **Weighted Multi-Factor Scoring System** — not a simple percentage match.
>
> - **70% weight** goes to required skill coverage — the most important factor.
> - **20%** is given as a bonus for optional skills.
> - **10%** comes from **prerequisite chains** — this is the novel part.
>
> For example: if a job requires React, and a student doesn't have React but *does* have JavaScript — which is a prerequisite for React — they receive 35% partial credit for that slot. This is more realistic than giving them a zero."

---

## Slide 5 — Technology Stack
> "For the frontend we used **React 18** with Vite — which gives us extremely fast development and optimised builds. The backend is **Node.js with Express**, secured with Helmet.js for HTTP headers and rate limiting at 100 requests per 15 minutes to prevent abuse. The database is **MongoDB Atlas** — a cloud NoSQL database — accessed via Mongoose ODM. The whole application is deployed on **Vercel** using serverless functions."

---

## Slide 6 — Key Features
> "Let me highlight what makes SkillMatch stand out technically:
>
> 1. **Skill Normalization** — we built a 100+ entry alias map so 'JS', 'JavaScript', and 'javascript' are all treated the same. This prevents false mismatches.
> 2. **Auto-refreshing cache** — the system fetches real hackathon and internship data from external APIs and caches it for 6 hours in MongoDB. When the cache is stale, it refreshes automatically in the background.
> 3. **Colour-coded readiness** — green for 70%+ match, yellow for 40–70%, red below 40%.
> 4. **Security** — Helmet headers, rate limiting, JWT authentication, and environment variables via dotenv.
> 5. **Skill gap analysis** — for every opportunity, we show exactly which skills matched and which are missing."

---

## Slide 7 — Architecture & APIs
> "Our system follows a clean **layered architecture**: React handles the presentation layer, Express manages the API gateway, the matching algorithm runs as business logic, and MongoDB stores the data. We have 7 REST API endpoints. The most interesting one is `POST /api/match` — it receives the user's skill list and runs the weighted scoring algorithm against every opportunity in the database, returning ranked results."

---

## Slide 8 — Challenges & Learnings
> "Let me be transparent about the challenges we faced. The hardest problem was **skill normalization** — without it, 'Machine Learning' and 'ML' would never match. We solved this with a dedicated alias mapping file. Another challenge was data freshness — we didn't want to call external APIs on every page load, so we implemented the 6-hour MongoDB cache. CORS was tricky because our dev server runs on port 5173 while production is on Vercel — we solved this with a dynamic origin allowlist and Vite proxy.
>
> For future scope, we envision a resume parser, recruiter dashboard, and eventually an ML-based recommendation engine."

---

## Slide 9 — Conclusion
> "To summarise: SkillMatch is a production-ready full-stack platform that uses a custom weighted algorithm with prerequisite-chain awareness to match students to the right opportunities. The key technical insight is that skills are not a flat list — they have relationships and dependencies. Knowing JavaScript *does* make you closer to React.
>
> Thank you for your time. We're happy to take any questions or run a live demo."

---

## Common Panel Questions & Suggested Answers

**Q: Why did you choose MongoDB over SQL?**
> "Opportunity listings have variable schemas — different platforms list different fields. MongoDB's flexible document model let us handle this without complex migrations. We also used Mongoose for schema validation where consistency was needed."

**Q: How do you handle the prerequisite chains — did you research this?**
> "We modelled it based on common learning paths in software development. For example, you can't learn React without knowing JavaScript. The prerequisite graph is stored in a JavaScript object in the algorithm file and is easy to extend."

**Q: What is the time complexity of the algorithm?**
> "The algorithm is O(n × m) where n is the number of opportunities and m is the size of the skill set. Practically, this runs in milliseconds because skill arrays are small and we use JavaScript Sets for O(1) lookup."

**Q: Is the application deployed live?**
> "Yes — it is configured for Vercel deployment with a `vercel.json` routing config and the serverless functions pattern. It can be demoed locally at localhost:5173."

**Q: How do you prevent the database from having duplicate records?**
> "We use `findOneAndUpdate` with `upsert: true` keyed on the unique `applyUrl` field. This means re-running the seeder or cache refresh never creates duplicates."
