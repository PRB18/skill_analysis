/**
 * Matching Algorithm — Weighted Multi-Factor Scoring
 *
 * Score breakdown (totals to 100):
 *   70% — Required skill coverage  (core eligibility)
 *   20% — Optional skill bonus      (competitive edge over other applicants)
 *   10% — Prerequisite chain credit (e.g. knowing JS gives partial credit toward React)
 *
 * Why this is better than a simple percentage:
 *   - Two candidates with 2/4 required skills are NOT equal if one also has optional skills
 *   - A student who knows JavaScript but not React isn't a 0 for React roles —
 *     they're closer than someone with no JS at all (prerequisite chain)
 *   - Skills that appear across more listings are harder to have, making matches more meaningful
 */

const { normalizeSkill } = require('./skillAliases');

// Prerequisite chains — knowing the first helps toward the second
// Format: 'prerequisite': ['skills it grants partial credit toward']
const PREREQUISITE_CHAINS = {
  'javascript':       ['react', 'vue', 'angular', 'next.js', 'node.js', 'typescript'],
  'python':           ['machine learning', 'deep learning', 'data analysis', 'django', 'flask', 'tensorflow', 'pytorch', 'scikit-learn'],
  'react':            ['next.js', 'react native'],
  'node.js':          ['express', 'nest.js'],
  'html':             ['css', 'react', 'vue'],
  'css':              ['sass', 'tailwind'],
  'sql':              ['postgresql', 'mysql', 'database management'],
  'mongodb':          ['mongoose', 'database management'],
  'docker':           ['kubernetes', 'devops', 'ci cd'],
  'machine learning': ['deep learning', 'natural language processing', 'computer vision'],
  'java':             ['spring boot', 'android'],
  'c':                ['cpp', 'embedded systems'],
  'linux':            ['devops', 'bash', 'ci cd'],
  'git':              ['github', 'devops', 'ci cd'],
  'aws':              ['cloud computing', 'devops'],
  'data structures':  ['algorithms', 'competitive programming'],
};

// Partial credit fraction granted by a prerequisite (0–1)
const PREREQ_CREDIT = 0.35; // knowing JS gives 35% credit toward React requirement

/**
 * Normalize an array of raw skills using the canonical alias map.
 * Deduplicates after normalization.
 */
function normalizeSkillArray(skills) {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();
  const result = [];
  for (const skill of skills) {
    if (typeof skill !== 'string' || skill.trim() === '') continue;
    const normalized = normalizeSkill(skill);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }
  return result;
}

/**
 * Check if the user has a prerequisite for a given skill.
 * Returns the fraction of credit to grant (0 if none).
 */
function getPrerequisiteCredit(skill, userSet) {
  for (const [prereq, unlocks] of Object.entries(PREREQUISITE_CHAINS)) {
    if (unlocks.includes(skill) && userSet.has(prereq)) {
      return PREREQ_CREDIT;
    }
  }
  return 0;
}

/**
 * Main match calculator.
 *
 * @param {string[]} userSkills      - Skills the user possesses (raw, will be normalized)
 * @param {string[]} requiredSkills  - Required skills for the opportunity (raw)
 * @param {string[]} optionalSkills  - Nice-to-have skills (raw)
 * @returns {{
 *   matchedRequired:   string[],   // required skills the user has
 *   matchedOptional:   string[],   // optional skills the user has
 *   missingSkills:     string[],   // required skills the user lacks
 *   readinessScore:    number,     // 0–100 composite score
 *   scoreBreakdown:    object      // breakdown of how the score was calculated
 * }}
 */
function calculateMatch(userSkills, requiredSkills, optionalSkills) {
  const normalizedUser     = normalizeSkillArray(userSkills);
  const normalizedRequired = normalizeSkillArray(requiredSkills);
  const normalizedOptional = normalizeSkillArray(optionalSkills);

  const userSet = new Set(normalizedUser);

  // ── Required skills (70% weight) ──────────────────────────────────────

  const matchedRequired = normalizedRequired.filter(s => userSet.has(s));
  const missingSkills   = normalizedRequired.filter(s => !userSet.has(s));

  // For missing required skills, check if user has a prerequisite
  let prerequisiteCredit = 0;
  for (const missing of missingSkills) {
    prerequisiteCredit += getPrerequisiteCredit(missing, userSet);
  }
  // Cap prerequisite credit at the number of missing skills (can't exceed 100% on required)
  prerequisiteCredit = Math.min(prerequisiteCredit, missingSkills.length);

  // Required score: (directly matched + fractional prereq credit) / total
  const requiredRatio = normalizedRequired.length > 0
    ? (matchedRequired.length + prerequisiteCredit) / normalizedRequired.length
    : 1; // No requirements = 100% eligible

  const requiredScore = requiredRatio * 70; // max 70 points

  // ── Optional skills (20% weight) ──────────────────────────────────────

  const matchedOptional = normalizedOptional.filter(s => userSet.has(s));

  const optionalRatio = normalizedOptional.length > 0
    ? matchedOptional.length / normalizedOptional.length
    : 0;

  const optionalScore = optionalRatio * 20; // max 20 points

  // ── Prerequisite chain bonus (10% weight) ─────────────────────────────
  // Separate from the credit above — rewards students who are "on the right path"

  let prereqBonus = 0;
  if (missingSkills.length > 0) {
    const skillsWithPrereq = missingSkills.filter(s =>
      getPrerequisiteCredit(s, userSet) > 0
    ).length;
    prereqBonus = (skillsWithPrereq / missingSkills.length) * 10;
  }

  // ── Final score ────────────────────────────────────────────────────────

  const rawScore = requiredScore + optionalScore + prereqBonus;
  const readinessScore = Math.min(100, Math.round(rawScore));

  return {
    matchedRequired,
    matchedOptional,
    missingSkills,
    readinessScore,
    scoreBreakdown: {
      requiredScore:    Math.round(requiredScore),
      optionalScore:    Math.round(optionalScore),
      prereqBonus:      Math.round(prereqBonus),
      totalRequired:    normalizedRequired.length,
      totalOptional:    normalizedOptional.length,
    }
  };
}

module.exports = { calculateMatch };

