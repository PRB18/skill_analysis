/**
 * OpportunityCard Component
 * Displays a single opportunity with match data.
 * Shows readiness score, matched/missing skills, "Learn →" resource links,
 * and a working "Apply Now" button that opens the real opportunity URL.
 */

import { SKILL_RESOURCES } from '../utils/skillAliases';
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
  applyUrl,
  location,
  prizePool,
  source,
  description
}) {
  const getScoreColor = () => {
    if (readinessScore >= 70) return '#22c55e';
    if (readinessScore >= 40) return '#eab308';
    return '#ef4444';
  };

  const getScoreLabel = () => {
    if (readinessScore === 100) return "You're ready! 🎉";
    if (readinessScore >= 70)  return 'Almost there! 💪';
    if (readinessScore >= 40)  return 'Good start! 📈';
    return 'Keep learning! 📚';
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Source label mappings
  const sourceLabels = {
    devpost:  '🏆 Devpost',
    remotive: '🌐 Remotive',
    mlh:      '🎓 MLH',
    manual:   '✍️ Manual',
    fallback: '📌 Featured'
  };

  return (
    <article className="opportunity-card">
      {/* Header */}
      <header className="card-header">
        <div className="card-header-row">
          <div className="company-info">
            <h3 className="company-name">{company}</h3>
            <div className="card-badges">
              <span className={`type-badge type-${type}`}>
                {capitalize(type)}
              </span>
              {source && sourceLabels[source] && (
                <span className="source-badge">{sourceLabels[source]}</span>
              )}
            </div>
          </div>
        </div>
        <h4 className="job-title">{title}</h4>

        {/* Meta info row */}
        <div className="card-meta">
          {location && (
            <span className="meta-item">📍 {location}</span>
          )}
          {prizePool && (
            <span className="meta-item">💰 {prizePool}</span>
          )}
        </div>

        {description && (
          <p className="card-description">{description}</p>
        )}
      </header>

      {/* Readiness Score */}
      <section className="score-section">
        <div className="score-header">
          <span className="score-label">Readiness Score</span>
          <span className="score-value" style={{ color: getScoreColor() }}>
            {readinessScore}%
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${readinessScore}%`, backgroundColor: getScoreColor() }}
          />
        </div>
        <p className="score-message" style={{ color: getScoreColor() }}>
          {getScoreLabel()}
        </p>
      </section>

      {/* Skills Breakdown */}
      <section className="skills-section">
        {/* ✓ Matched Required Skills */}
        {matchedRequired.length > 0 && (
          <div className="skill-group">
            <h5 className="skill-group-title">✓ You have (Required)</h5>
            <div className="skill-chips">
              {matchedRequired.map((skill, i) => (
                <span key={i} className="skill-chip skill-matched">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* ✗ Missing Required Skills — with Learn links */}
        {missingSkills.length > 0 && (
          <div className="skill-group">
            <h5 className="skill-group-title">✗ Skills to learn (Required)</h5>
            <div className="skill-chips">
              {missingSkills.map((skill, i) => {
                const resourceUrl = SKILL_RESOURCES[skill];
                return (
                  <span key={i} className="skill-chip skill-missing skill-missing-wrap">
                    <span>{skill}</span>
                    {resourceUrl && (
                      <a
                        href={resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="learn-link"
                        title={`Free resources to learn ${skill}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn →
                      </a>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ★ Optional Skills Matched */}
        {matchedOptional.length > 0 && (
          <div className="skill-group">
            <h5 className="skill-group-title">★ Bonus skills you have</h5>
            <div className="skill-chips">
              {matchedOptional.map((skill, i) => (
                <span key={i} className="skill-chip skill-optional">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer: Skills summary + Apply button */}
      <footer className="card-footer">
        <p className="skills-summary">
          Required: {matchedRequired.length}/{requiredSkills.length} matched
          {optionalSkills.length > 0 &&
            ` • Optional: ${matchedOptional.length}/${optionalSkills.length}`}
        </p>
        <a
          href={applyUrl && applyUrl !== '#' ? applyUrl : 'https://devpost.com/hackathons'}
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
