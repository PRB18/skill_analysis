/**
 * App Component — Main Entry Point
 * Authentication gate: shows LoginPage if not logged in.
 * After login, profile (name + skills) is loaded from the server account.
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import SkillInput from './components/SkillInput';
import OpportunityCard from './components/OpportunityCard';
import SkillTrends from './components/SkillTrends';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import './App.css';

// ─── AUTH HELPERS ────────────────────────────────────────────────────────

function getStoredAuth() {
  try {
    const token = localStorage.getItem('skillmatch_token');
    const user  = JSON.parse(localStorage.getItem('skillmatch_user') || 'null');
    return { token, user };
  } catch { return { token: null, user: null }; }
}

function clearAuth() {
  localStorage.removeItem('skillmatch_token');
  localStorage.removeItem('skillmatch_user');
}

// ─── MAIN APP PAGE ───────────────────────────────────────────────────────

function MainApp({ user, token, onLogout }) {
  const [userName, setUserName]   = useState(user?.name || '');
  const [userSkills, setUserSkills] = useState(user?.skills || []);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [trends, setTrends]       = useState([]);
  const [filter, setFilter]       = useState('all');
  const [normalizedSkills, setNormalizedSkills] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedMsg, setSavedMsg]   = useState('');

  // Load skill trends on mount
  useEffect(() => {
    axios.get('/api/match/trends')
      .then(res => setTrends(res.data.data || []))
      .catch(() => {});
  }, []);

  // ── Find Matches ─────────────────────────────────────────────────────

  const handleMatch = async () => {
    if (userSkills.length === 0) {
      setError('Please add at least one skill');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/match', { skills: userSkills });
      setResults(response.data.data || []);
      setNormalizedSkills(response.data.normalizedSkills || []);
    } catch (err) {
      console.error('Match error:', err);
      setError(err.response?.data?.error || 'Failed to fetch matches. Is the server running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  // ── Save Profile to account ──────────────────────────────────────────

  const saveProfile = async () => {
    if (userSkills.length === 0) {
      setError('Please add at least one skill');
      return;
    }
    setSavingProfile(true);
    setError(null);
    try {
      await axios.put('/api/auth/profile', { name: userName, skills: userSkills }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Also update localStorage cache so page refresh keeps the skills
      localStorage.setItem('skillmatch_user', JSON.stringify({ ...user, name: userName, skills: userSkills }));
      setSavedMsg('✅ Profile saved to your account!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Apply type filter to results
  const filteredResults  = filter === 'all' ? results : results.filter(r => r.type === filter);
  const hackathonCount   = results.filter(r => r.type === 'hackathon').length;
  const internshipCount  = results.filter(r => r.type === 'internship').length;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>⚡ SkillMatch</h1>
            <p className="tagline">
              Find internships &amp; hackathons matched to your exact skills — and see exactly what to learn next
            </p>
          </div>
          <div className="header-actions">
            <span className="user-greeting">👋 {user?.name || 'User'}</span>
            <button className="logout-btn" onClick={onLogout} title="Log out">↩ Logout</button>
            <Link to="/admin" className="admin-link-btn" title="Admin Panel">⚙️</Link>
          </div>
        </div>
      </header>

      <main className="app-main">

        {/* Skill Trends — shown when no search yet */}
        {results.length === 0 && !loading && trends.length > 0 && (
          <SkillTrends trends={trends} />
        )}

        {/* User Name */}
        <section className="name-section">
          <label htmlFor="userName">Your Name</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Enter your name (optional)"
            className="name-input"
          />
        </section>

        {/* Skill Input */}
        <SkillInput userSkills={userSkills} setUserSkills={setUserSkills} />

        {/* Action Buttons */}
        <div className="actions">
          <button
            onClick={handleMatch}
            disabled={loading || userSkills.length === 0}
            className="btn-primary"
          >
            {loading ? '🔍 Finding Matches...' : '🚀 Find Matches'}
          </button>
          <button
            onClick={saveProfile}
            disabled={savingProfile || userSkills.length === 0}
            className="btn-secondary"
          >
            {savingProfile ? '💾 Saving...' : '💾 Save Profile'}
          </button>
        </div>

        {/* Save success message */}
        {savedMsg && <div className="save-success-msg">{savedMsg}</div>}

        {/* Recognized Skills Note */}
        {normalizedSkills.length > 0 && results.length > 0 && (
          <div className="recognized-note">
            🎯 Matching against: {normalizedSkills.join(', ')}
          </div>
        )}

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Results */}
        {results.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>Found {results.length} Opportunit{results.length === 1 ? 'y' : 'ies'} 🎯</h2>

              {/* Filter Tabs */}
              <div className="filter-tabs">
                <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                  All ({results.length})
                </button>
                <button className={`filter-tab ${filter === 'internship' ? 'active' : ''}`} onClick={() => setFilter('internship')}>
                  💼 Internships ({internshipCount})
                </button>
                <button className={`filter-tab ${filter === 'hackathon' ? 'active' : ''}`} onClick={() => setFilter('hackathon')}>
                  🏆 Hackathons ({hackathonCount})
                </button>
              </div>
            </div>

            <div className="results-grid">
              {filteredResults.map((result) => (
                <OpportunityCard
                  key={result._id}
                  title={result.title}
                  company={result.company}
                  type={result.type}
                  requiredSkills={result.requiredSkills || []}
                  optionalSkills={result.optionalSkills || []}
                  matchedRequired={result.matchData.matchedRequired}
                  matchedOptional={result.matchData.matchedOptional}
                  missingSkills={result.matchData.missingSkills}
                  readinessScore={result.matchData.readinessScore}
                  scoreBreakdown={result.matchData.scoreBreakdown}
                  applyUrl={result.applyUrl}
                  location={result.location}
                  prizePool={result.prizePool}
                  source={result.source}
                  description={result.description}
                />
              ))}
            </div>

            {trends.length > 0 && <SkillTrends trends={trends} />}
          </section>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <section className="empty-state">
            <h3>How it works:</h3>
            <ol>
              <li>Type your skills (abbreviations like <strong>js</strong>, <strong>py</strong>, <strong>k8s</strong> work!)</li>
              <li>Click <strong>Find Matches</strong></li>
              <li>See your readiness score for every live opportunity</li>
              <li>Click <strong>Learn →</strong> on missing skills for free resources</li>
              <li>Click <strong>Apply Now</strong> to go directly to the real listing</li>
              <li>Click <strong>Save Profile</strong> to save your skills to your account</li>
            </ol>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── ROOT WITH AUTH GATE ─────────────────────────────────────────────────

function App() {
  const { token: storedToken, user: storedUser } = getStoredAuth();
  const [authToken, setAuthToken] = useState(storedToken);
  const [authUser,  setAuthUser]  = useState(storedUser);

  const handleLogin = (user, token) => {
    setAuthToken(token);
    setAuthUser(user);
  };

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    setAuthUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route
          path="/*"
          element={
            authToken && authUser
              ? <MainApp user={authUser} token={authToken} onLogout={handleLogout} />
              : <LoginPage onLogin={handleLogin} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
