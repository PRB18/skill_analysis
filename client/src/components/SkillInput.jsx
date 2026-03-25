/**
 * SkillInput Component
 * Allows users to add and remove skills
 * Displays skills as removable chips/tags
 *
 * Props:
 *   - userSkills: Array of current skills
 *   - setUserSkills: Function to update skills array
 */

import { useState } from 'react';
import './SkillInput.css';

function SkillInput({ userSkills, setUserSkills }) {
  // Local state for the current input value
  const [inputValue, setInputValue] = useState('');

  /**
   * addSkill - Adds a new skill to the userSkills array
   * Normalizes input: trims whitespace and converts to lowercase
   * Prevents duplicate skills
   */
  const addSkill = () => {
    const skill = inputValue.trim().toLowerCase();

    // Validation: don't add empty skills
    if (!skill) {
      return;
    }

    // Validation: don't add duplicate skills
    if (userSkills.includes(skill)) {
      setInputValue('');
      return;
    }

    // Add skill to array
    setUserSkills([...userSkills, skill]);

    // Clear input field
    setInputValue('');
  };

  /**
   * removeSkill - Removes a skill from the userSkills array
   * Called when clicking the X button on a skill chip
   */
  const removeSkill = (skillToRemove) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
  };

  /**
   * handleKeyDown - Adds skill when Enter key is pressed
   * Improves UX by allowing keyboard-only interaction
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <section className="skill-input-section">
      <label htmlFor="skillInput">Your Skills</label>

      {/* Input field and Add button */}
      <div className="skill-input-container">
        <input
          id="skillInput"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., React, Python, JavaScript"
          className="skill-input"
        />
        <button
          onClick={addSkill}
          className="btn-add-skill"
          disabled={!inputValue.trim()}
        >
          Add Skill
        </button>
      </div>

      {/* Skills display as chips/tags */}
      {userSkills.length > 0 && (
        <div className="skills-container">
          <p className="skills-label">{userSkills.length} skill{userSkills.length !== 1 ? 's' : ''} added:</p>

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

      {/* Empty state message */}
      {userSkills.length === 0 && (
        <p className="no-skills-message">
          No skills added yet. Start typing to add your skills!
        </p>
      )}
    </section>
  );
}

export default SkillInput;
