/**
 * OpportunityCard Component
 * Displays a single opportunity with match data
 * Shows readiness score, matched/missing skills, and recommendations
 *
 * Props:
 *   - title: Job/hackathon title
 *   - company: Company name
 *   - type: 'internship' or 'hackathon'
 *   - requiredSkills: Array of required skills
 *   - optionalSkills: Array of optional skills
 *   - matchedRequired: User skills that match required skills
 *   - matchedOptional: User skills that match optional skills
 *   - missingSkills: Required skills user doesn't have
 *   - readinessScore: Percentage (0-100)
 *   - applyUrl: URL to apply for the opportunity
 */

import './OpportunityCard.css';

function OpportunityCard({
  title,
  company,
  type,
  requiredSkills,
  optionalSkills,
  matchedRequired,
  matchedOptional,
  missingSkills,
  readinessScore,
  applyUrl
}) {
  /**
   * getScoreColor - Returns color based on readiness score
   * Green: 70%+ (good match)
   * Yellow: 40-70% (moderate match)
   * Red: Below 40% (needs more skills)
   */
  const getScoreColor = () => {
    if (readinessScore >= 70) return '#22c55e'; // Green
    if (readinessScore >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  /**
   * getMessage - Returns encouragement message based on score
   */
  const getMessage = () => {
    if (readinessScore === 100) return "You're ready! 🎉";
    if (readinessScore >= 70) return 'Almost there! 💪';
    return 'Keep learning! 📚';
  };

  /**
   * capitalize - Capitalizes first letter of a string
   */
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <article className="opportunity-card">
      {/* Header: Company and Title */}
      <header className="card-header">
        <div className="company-info">
          <h3 className="company-name">{company}</h3>
          <span className={`type-badge type-${type}`}>
            {capitalize(type)}
          </span>
        </div>
        <h4 className="job-title">{title}</h4>
      </header>

      {/* Readiness Score Section */}
      <section className="score-section">
        <div className="score-header">
          <span className="score-label">Readiness Score</span>
          <span
            className="score-value"
            style={{ color: getScoreColor() }}
          >
            {readinessScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${readinessScore}%`,
              backgroundColor: getScoreColor()
            }}
          />
        </div>

        {/* Encouragement Message */}
        <p className="score-message" style={{ color: getScoreColor() }}>
          {getMessage()}
        </p>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        {/* Required Skills - Matched (Green) */}
        {matchedRequired.length > 0 && (
          <div className="skill-group">
            <h5 className="skill-group-title">
              ✓ Skills You Have (Required)
            </h5>
            <div className="skill-chips">
              {matchedRequired.map((skill, index) => (
                <span key={index} className="skill-chip skill-matched">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills (Red) */}
        {missingSkills.length > 0 && (
          <div className="skill-group">
            <h5 className="skill-group-title">
              ✗ Skills to Learn (Required)
            </h5>
            <div className="skill-chips">
              {missingSkills.map((skill, index) => (
                <span key={index} className="skill-chip skill-missing">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Optional Skills - Matched (Blue) */}
        {matchedOptional.length > 0 && (
          <div className="skill-group">
            <h5 className="skill-group-title">
              ★ Bonus Skills (Optional)
            </h5>
            <div className="skill-chips">
              {matchedOptional.map((skill, index) => (
                <span key={index} className="skill-chip skill-optional">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer: Summary and Apply Button */}
      <footer className="card-footer">
        <p className="skills-summary">
          Required: {matchedRequired.length}/{requiredSkills.length} matched
          {optionalSkills.length > 0 &&
            ` • Optional: ${matchedOptional.length}/${optionalSkills.length} matched`}
        </p>
        <a
          href={applyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="apply-button"
        >
          Apply Now →
        </a>
      </footer>
    </article>
  );
}

export default OpportunityCard;
