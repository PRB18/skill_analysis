/**
 * SkillTrends Component
 * Shows the top N most-demanded skills across all active opportunities.
 * This is the unique differentiator — tells students what to learn next
 * based on real market demand from live listings.
 */

import './SkillTrends.css';

function SkillTrends({ trends }) {
  if (!trends || trends.length === 0) return null;

  const maxCount = trends[0]?.count || 1;

  return (
    <section className="skill-trends" aria-label="In-demand skills">
      <div className="trends-header">
        <h2 className="trends-title">🔥 Most In-Demand Skills</h2>
        <p className="trends-subtitle">
          Based on {trends.reduce((a, t) => a + t.count, 0)}+ active listings — learn these to maximize your matches
        </p>
      </div>

      <div className="trends-list">
        {trends.map((item, index) => {
          const pct = Math.round((item.count / maxCount) * 100);
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
          return (
            <div key={item.skill} className="trend-item">
              <div className="trend-rank">{medal}</div>
              <div className="trend-info">
                <span className="trend-skill">{item.skill}</span>
                <div className="trend-bar-container">
                  <div
                    className="trend-bar"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
              <span className="trend-count">{item.count} listings</span>
            </div>
          );
        })}
      </div>

      <p className="trends-footer">
        💡 Tip — enter any of these skills above and hit <strong>Find Matches</strong>
      </p>
    </section>
  );
}

export default SkillTrends;
