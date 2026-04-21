/**
 * SkillInput Component
 * Allows users to add and remove skills.
 * Normalizes input: "js" → "javascript", "py" → "python", etc.
 * Shows the canonical name with the original alias in a tooltip.
 */

import { useState } from 'react';
import { normalizeSkill } from '../utils/skillAliases';
import './SkillInput.css';

function SkillInput({ userSkills, setUserSkills }) {
  const [inputValue, setInputValue] = useState('');
  const [aliasNote, setAliasNote] = useState(''); // e.g. "js → javascript"

  /**
   * addSkill — normalizes the input then adds if not duplicate.
   */
  const addSkill = () => {
    const raw = inputValue.trim();
    if (!raw) return;

    const normalized = normalizeSkill(raw);

    // Show aliasNote only when normalization changed the value
    if (normalized !== raw.toLowerCase()) {
      setAliasNote(`"${raw}" → "${normalized}"`);
      setTimeout(() => setAliasNote(''), 3000);
    }

    // Don't add duplicates
    if (userSkills.includes(normalized)) {
      setInputValue('');
      return;
    }

    setUserSkills([...userSkills, normalized]);
    setInputValue('');
  };

  const removeSkill = (skillToRemove) => {
    setUserSkills(userSkills.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <section className="skill-input-section">
      <label htmlFor="skillInput">Your Skills</label>
      <p className="skill-hint">
        Use abbreviations freely — e.g. <strong>js</strong>, <strong>py</strong>, <strong>ts</strong>, <strong>k8s</strong>
      </p>

      <div className="skill-input-container">
        <input
          id="skillInput"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. js, py, react, k8s..."
          className="skill-input"
          autoComplete="off"
        />
        <button
          onClick={addSkill}
          className="btn-add-skill"
          disabled={!inputValue.trim()}
        >
          Add
        </button>
      </div>

      {/* Alias notification */}
      {aliasNote && (
        <p className="alias-note">
          ✨ Recognized: {aliasNote}
        </p>
      )}

      {/* Skills display as chips/tags */}
      {userSkills.length > 0 && (
        <div className="skills-container">
          <p className="skills-label">
            {userSkills.length} skill{userSkills.length !== 1 ? 's' : ''} added:
          </p>
          <div className="skills-list">
            {userSkills.map((skill, index) => (
              <span key={index} className="skill-chip">
                <span className="skill-text">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="skill-remove-btn"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {userSkills.length === 0 && (
        <p className="no-skills-message">
          No skills added yet. Start typing to add your skills!
        </p>
      )}
    </section>
  );
}

export default SkillInput;
