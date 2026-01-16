import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'

export default function Login({ initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab === 'register' ? 'register' : 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [rUsername, setRUsername] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rRoles, setRRoles] = useState(['VENDOR'])
  const [rError, setRError] = useState('')
  const [rSuccess, setRSuccess] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()
  const client = createClient(() => null)
  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8080/swagger-ui.html`

  function switchTab(next) {
    setTab(next)
    nav(next === 'register' ? '/register' : '/login', { replace: true })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await client.post('/auth/login', { username, password })
      login(res)
      nav('/app')
    } catch (err) {
      setError((err.data && err.data.message) || 'Invalid credentials')
    }
  }

  async function onRegister(e) {
    e.preventDefault()
    setRError('')
    setRSuccess('')
    try {
      await client.post('/auth/register', {
        username: rUsername,
        email: rEmail,
        password: rPassword,
        roles: rRoles.length ? rRoles : ['VENDOR']
      })
      setRSuccess('Account created. Please sign in.')
      setUsername(rUsername)
      setPassword('')
      setRUsername('')
      setREmail('')
      setRPassword('')
      setRRoles(['VENDOR'])
      switchTab('login')
    } catch (err) {
      setRError((err.data && err.data.message) || 'Registration failed')
    }
  }

  return (
    <section className="view">
      <div className="auth-layout">
        <div className="auth-hero">
          <h1>Vendor & Procurement Management</h1>
          <p>Manage vendors, requisitions, and orders with secure access and role-aware workflows.</p>
          <div className="auth-actions">
            <a href={swaggerUrl} className="btn outline" target="_blank" rel="noreferrer">API Docs</a>
          </div>
        </div>
        <div className="auth-card">
          <nav className="tabs">
            <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Login</button>
            <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Sign Up</button>
          </nav>

          {tab === 'login' && (
            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                <span>Username</span>
                <input value={username} onChange={e => setUsername(e.target.value)} required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </label>
              <button type="submit" className="btn primary">Login</button>
              {error && <div className="error">{error}</div>}
            </form>
          )}

          {tab === 'register' && (
            <form className="form-grid" onSubmit={onRegister}>
              <label>
                <span>Username</span>
                <input value={rUsername} onChange={e => setRUsername(e.target.value)} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={rEmail} onChange={e => setREmail(e.target.value)} required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={rPassword} onChange={e => setRPassword(e.target.value)} required />
              </label>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ display: 'block', color: '#98a2b3', fontSize: 12, marginBottom: 6 }}>Roles</span>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'].map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={rRoles.includes(r)}
                        onChange={e => {
                          if (e.target.checked) setRRoles(Array.from(new Set([...rRoles, r])))
                          else setRRoles(rRoles.filter(x => x !== r))
                        }}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn primary">Create Account</button>
              {rError && <div className="error">{rError}</div>}
              {rSuccess && <div className="muted-row">{rSuccess}</div>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
