/**
 * AdminPanel Page
 * Protected admin dashboard for managing the SkillMatch platform.
 * Login with ADMIN_SECRET_KEY from the .env file.
 *
 * Features:
 *  - Stats overview (total listings, users, last fetch)
 *  - One-click data refresh from external sources
 *  - Opportunity management (view, deactivate, delete)
 *  - Add opportunities manually
 *  - User management
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const api = axios.create({ baseURL: '/api/admin' });

// Attach token to every admin request
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── LOGIN VIEW ─────────────────────────────────────────────────────────

function AdminLogin({ onLogin }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/admin/login', { secretKey: key });
      sessionStorage.setItem('admin_token', res.data.token);
      onLogin();
    } catch {
      setError('Invalid secret key. Check your .env file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-icon">🔐</div>
        <h1 className="admin-login-title">Admin Panel</h1>
        <p className="admin-login-sub">Enter your secret key to continue</p>
        <form onSubmit={handleLogin} className="admin-login-form">
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Secret key..."
            className="admin-input"
            autoFocus
            required
          />
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Login →'}
          </button>
        </form>
        <p className="admin-login-hint">
          Key is set in <code>server/.env</code> as <code>ADMIN_SECRET_KEY</code>
        </p>
      </div>
    </div>
  );
}

// ─── STATS CARDS ────────────────────────────────────────────────────────

function StatsCard({ icon, label, value, sub }) {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-info">
        <p className="stats-value">{value ?? '—'}</p>
        <p className="stats-label">{label}</p>
        {sub && <p className="stats-sub">{sub}</p>}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState('');
  const [addForm, setAddForm] = useState({ title: '', company: '', type: 'internship', applyUrl: '', description: '', location: 'Remote', requiredSkills: '', optionalSkills: '' });

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 4000); };

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data.data);
    } catch (err) {
      if (err.response?.status === 403) onLogout();
    }
  }, [onLogout]);

  const loadOpportunities = useCallback(async () => {
    const res = await api.get('/opportunities?limit=50');
    setOpportunities(res.data.data);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await api.get('/users');
    setUsers(res.data.data);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => {
    if (tab === 'opportunities') loadOpportunities();
    if (tab === 'users') loadUsers();
  }, [tab, loadOpportunities, loadUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.post('/opportunities/refresh');
      flash(`✅ ${res.data.message}`);
      loadStats();
      if (tab === 'opportunities') loadOpportunities();
    } catch {
      flash('❌ Refresh failed. Check server logs.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleActive = async (id, current) => {
    await api.patch(`/opportunities/${id}`, { isActive: !current });
    loadOpportunities();
    flash(`Opportunity ${!current ? 'activated' : 'deactivated'}`);
  };

  const deleteOpportunity = async (id) => {
    if (!window.confirm('Delete this opportunity permanently?')) return;
    await api.delete(`/opportunities/${id}`);
    loadOpportunities();
    flash('🗑️ Deleted');
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user profile?')) return;
    await api.delete(`/users/${id}`);
    loadUsers();
    flash('🗑️ User deleted');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/opportunities', {
        ...addForm,
        requiredSkills: addForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        optionalSkills: addForm.optionalSkills.split(',').map(s => s.trim()).filter(Boolean),
      });
      flash('✅ Opportunity added!');
      setAddForm({ title: '', company: '', type: 'internship', applyUrl: '', description: '', location: 'Remote', requiredSkills: '', optionalSkills: '' });
      loadStats();
    } catch {
      flash('❌ Failed to add. Check required fields.');
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">⚙️ SkillMatch Admin</h1>
        </div>
        <div className="admin-header-right">
          <button
            className={`admin-btn-refresh ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Data'}
          </button>
          <button className="admin-btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {/* Flash message */}
      {msg && <div className="admin-flash">{msg}</div>}

      {/* Tabs */}
      <nav className="admin-tabs">
        {['stats', 'opportunities', 'add', 'users'].map(t => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {{ stats: '📊 Stats', opportunities: '📋 Listings', add: '➕ Add New', users: '👥 Users' }[t]}
          </button>
        ))}
      </nav>

      {/* Tab: Stats */}
      {tab === 'stats' && stats && (
        <div className="admin-content">
          <div className="stats-grid">
            <StatsCard icon="📋" label="Total Listings" value={stats.totalOpportunities} />
            <StatsCard icon="✅" label="Active" value={stats.activeCount} />
            <StatsCard icon="🏆" label="Hackathons" value={stats.hackathonCount} />
            <StatsCard icon="💼" label="Internships" value={stats.internshipCount} />
            <StatsCard icon="👥" label="Users" value={stats.totalUsers} />
            <StatsCard
              icon="🕐"
              label="Last Fetch"
              value={stats.lastFetch ? new Date(stats.lastFetch).toLocaleString() : 'Never'}
              sub={stats.dbStatus === 'connected' ? '🟢 DB Connected' : '🔴 DB Offline'}
            />
          </div>
          <div className="source-breakdown">
            <h3>By Source</h3>
            <div className="source-chips">
              {stats.sourceBreakdown?.map(s => (
                <span key={s._id} className="source-chip">
                  {s._id}: <strong>{s.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Opportunities */}
      {tab === 'opportunities' && (
        <div className="admin-content">
          <p className="admin-count">{opportunities.length} listings</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map(op => (
                  <tr key={op._id} className={op.isActive ? '' : 'inactive-row'}>
                    <td>
                      <a href={op.applyUrl} target="_blank" rel="noopener noreferrer"
                        className="admin-link">{op.title}</a>
                    </td>
                    <td>{op.company}</td>
                    <td><span className={`type-badge type-${op.type}`}>{op.type}</span></td>
                    <td>{op.source}</td>
                    <td>{op.isActive ? '✅' : '❌'}</td>
                    <td className="action-cell">
                      <button className="admin-btn-sm" onClick={() => toggleActive(op._id, op.isActive)}>
                        {op.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="admin-btn-sm danger" onClick={() => deleteOpportunity(op._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Add Opportunity */}
      {tab === 'add' && (
        <div className="admin-content">
          <h2 className="admin-section-title">Add Opportunity Manually</h2>
          <form onSubmit={handleAdd} className="admin-add-form">
            <div className="form-row">
              <label>Title *</label>
              <input className="admin-input" value={addForm.title}
                onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Company *</label>
              <input className="admin-input" value={addForm.company}
                onChange={e => setAddForm(f => ({ ...f, company: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Type *</label>
              <select className="admin-input" value={addForm.type}
                onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                <option value="internship">Internship</option>
                <option value="hackathon">Hackathon</option>
              </select>
            </div>
            <div className="form-row">
              <label>Apply URL *</label>
              <input className="admin-input" type="url" value={addForm.applyUrl}
                onChange={e => setAddForm(f => ({ ...f, applyUrl: e.target.value }))} required />
            </div>
            <div className="form-row">
              <label>Location</label>
              <input className="admin-input" value={addForm.location}
                onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Required Skills (comma separated)</label>
              <input className="admin-input" value={addForm.requiredSkills}
                placeholder="react, javascript, css"
                onChange={e => setAddForm(f => ({ ...f, requiredSkills: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Optional Skills (comma separated)</label>
              <input className="admin-input" value={addForm.optionalSkills}
                placeholder="typescript, redux"
                onChange={e => setAddForm(f => ({ ...f, optionalSkills: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea className="admin-input admin-textarea" value={addForm.description}
                onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <button type="submit" className="admin-btn-primary">Add Opportunity</button>
          </form>
        </div>
      )}

      {/* Tab: Users */}
      {tab === 'users' && (
        <div className="admin-content">
          <p className="admin-count">{users.length} registered users</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Skills</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>
                      <div className="skills-preview">
                        {(u.skills || []).slice(0, 5).map((s, i) => (
                          <span key={i} className="skill-pill">{s}</span>
                        ))}
                        {u.skills?.length > 5 && <span className="skill-pill">+{u.skills.length - 5}</span>}
                      </div>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-btn-sm danger" onClick={() => deleteUser(u._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────

function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(!!sessionStorage.getItem('admin_token'));

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setLoggedIn(false);
  };

  return loggedIn
    ? <AdminDashboard onLogout={handleLogout} />
    : <AdminLogin onLogin={() => setLoggedIn(true)} />;
}

export default AdminPanel;
