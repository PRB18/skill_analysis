/**
 * App Component - Main Entry Point
 * Manages global state for user skills, match results, and user name
 * Handles skill matching by calling the backend API
 */

import { useState } from 'react';
import axios from 'axios';
import SkillInput from './components/SkillInput';
import OpportunityCard from './components/OpportunityCard';
import './App.css';

function App() {
  // State for user name input
  const [userName, setUserName] = useState('');

  // State for user's skills array
  // Example: ['react', 'javascript', 'node.js']
  const [userSkills, setUserSkills] = useState([]);

  // State for match results from backend
  const [results, setResults] = useState([]);

  // State for loading status during API call
  const [loading, setLoading] = useState(false);

  // State for error messages
  const [error, setError] = useState(null);

  /**
   * handleMatch - Submits user skills to backend and fetches matches
   * POSTs skills array to /api/match
   * Receives array of opportunities with match data, sorted by readinessScore
   */
  const handleMatch = async () => {
    // Validate: need at least one skill to match
    if (userSkills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the match API with user's skills
      const response = await axios.post('/api/match', {
        skills: userSkills
      });

      // Store results in state
      // Results are already sorted by readinessScore descending from backend
      setResults(response.data.data);
    } catch (err) {
      console.error('Match error:', err);
      setError('Failed to fetch matches. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  /**
   * saveUser - Saves user profile to database (optional feature)
   * POSTs user name and skills to /api/users
   */
  const saveUser = async () => {
    if (!userName.trim() || userSkills.length === 0) {
      setError('Please enter your name and at least one skill');
      return;
    }

    try {
      await axios.post('/api/users', {
        name: userName,
        skills: userSkills
      });
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Save user error:', err);
      setError('Failed to save user profile');
    }
  };

  return (
    <div className="app">
      {/* Header Section */}
      <header className="app-header">
        <h1>SkillMatch</h1>
        <p className="tagline">
          Find the perfect internship or hackathon based on your skills
        </p>
      </header>

      <main className="app-main">
        {/* User Name Input */}
        <section className="name-section">
          <label htmlFor="userName">Your Name</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name (optional)"
            className="name-input"
          />
        </section>

        {/* Skill Input Component */}
        <SkillInput
          userSkills={userSkills}
          setUserSkills={setUserSkills}
        />

        {/* Action Buttons */}
        <div className="actions">
          <button
            onClick={handleMatch}
            disabled={loading || userSkills.length === 0}
            className="btn-primary"
          >
            {loading ? 'Finding Matches...' : 'Find Matches'}
          </button>

          {userName && (
            <button
              onClick={saveUser}
              className="btn-secondary"
            >
              Save Profile
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <section className="results-section">
            <h2>
              Found {results.length} Opportunit{results.length === 1 ? 'y' : 'ies'}
            </h2>

            <div className="results-grid">
              {results.map((result) => (
                <OpportunityCard
                  key={result._id}
                  // Opportunity details
                  title={result.title}
                  company={result.company}
                  type={result.type}
                  requiredSkills={result.requiredSkills}
                  optionalSkills={result.optionalSkills}
                  // Match data
                  matchedRequired={result.matchData.matchedRequired}
                  matchedOptional={result.matchData.matchedOptional}
                  missingSkills={result.matchData.missingSkills}
                  readinessScore={result.matchData.readinessScore}
                  // Apply link
                  applyUrl={result.applyUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State - Show instructions if no results */}
        {results.length === 0 && !loading && (
          <section className="empty-state">
            <h3>How it works:</h3>
            <ul>
              <li>Add your skills using the input above</li>
              <li>Click "Find Matches" to see matching opportunities</li>
              <li>View your readiness score for each position</li>
              <li>Identify missing skills to improve your match</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
