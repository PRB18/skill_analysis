/**
 * Matching Algorithm
 * Calculates how well a user's skills match an opportunity's requirements
 */

/**
 * Calculates match between user skills and opportunity requirements
 *
 * @param {[String]} userSkills - Array of skills the user possesses
 * @param {[String]} requiredSkills - Array of required skills for the opportunity
 * @param {[String]} optionalSkills - Array of optional skills for the opportunity
 * @returns {Object} Match result containing:
 *   - matchedRequired: Skills user has that are required
 *   - matchedOptional: Skills user has that are optional
 *   - missingSkills: Required skills the user doesn't have
 *   - readinessScore: Percentage (0-100) of required skills matched
 *
 * Algorithm:
 * 1. Normalize all skills to lowercase for case-insensitive comparison
 * 2. Find intersection between user skills and required skills
 * 3. Find intersection between user skills and optional skills
 * 4. Find required skills not in user skills (missing)
 * 5. Calculate readiness score: (matchedRequired / totalRequired) * 100
 */
function calculateMatch(userSkills, requiredSkills, optionalSkills) {
  // Normalize all skills to lowercase for case-insensitive comparison
  const normalizeSkills = (skills) =>
    skills
      .filter(skill => typeof skill === 'string' && skill.trim() !== '')
      .map(skill => skill.toLowerCase().trim());

  const normalizedUserSkills = normalizeSkills(userSkills);
  const normalizedRequired = normalizeSkills(requiredSkills);
  const normalizedOptional = normalizeSkills(optionalSkills);

  // Find matched required skills (user has these required skills)
  const matchedRequired = normalizedUserSkills.filter(skill =>
    normalizedRequired.includes(skill)
  );

  // Find matched optional skills (user has these optional skills)
  const matchedOptional = normalizedUserSkills.filter(skill =>
    normalizedOptional.includes(skill)
  );

  // Find missing skills (required skills user doesn't have)
  const missingSkills = normalizedRequired.filter(skill =>
    !normalizedUserSkills.includes(skill)
  );

  // Calculate readiness score
  // (number of matched required skills / total required skills) * 100
  const readinessScore = normalizedRequired.length > 0
    ? (matchedRequired.length / normalizedRequired.length) * 100
    : 100; // If no required skills, user is 100% ready

  return {
    matchedRequired,
    matchedOptional,
    missingSkills,
    readinessScore: Math.round(readinessScore) // Round to nearest integer
  };
}

module.exports = {
  calculateMatch
};
