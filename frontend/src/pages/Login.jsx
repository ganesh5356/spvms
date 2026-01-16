import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'

export default function Login({ initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab === 'register' ? 'register' : 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [rUsername, setRUsername] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rRoles, setRRoles] = useState(['VENDOR'])
  const [rError, setRError] = useState('')
  const [rSuccess, setRSuccess] = useState('')
  const [rFieldErrors, setRFieldErrors] = useState({})
  const { login } = useAuth()
  const nav = useNavigate()
  const client = createClient(() => null)
  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8080/swagger-ui.html`

  function switchTab(next) {
    setTab(next)
    nav(next === 'register' ? '/register' : '/login', { replace: true })
  }

  function validateLogin() {
    const errors = {}
    if (!username.trim()) errors.username = 'Username is required'
    if (!password.trim()) errors.password = 'Password is required'
    return errors
  }

  function validateRegister() {
    const errors = {}
    if (!rUsername.trim()) errors.username = 'Username is required'
    if (rUsername.length < 3) errors.username = 'Username must be at least 3 characters'
    if (!rEmail.trim()) errors.email = 'Email is required'
    if (!rEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email format'
    if (!rPassword.trim()) errors.password = 'Password is required'
    if (rPassword.length < 6) errors.password = 'Password must be at least 6 characters'
    return errors
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errors = validateLogin()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setError('')
    setFieldErrors({})
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
    const errors = validateRegister()
    if (Object.keys(errors).length > 0) {
      setRFieldErrors(errors)
      return
    }
    setRError('')
    setRSuccess('')
    setRFieldErrors({})
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
                <input value={username} onChange={e => setUsername(e.target.value)} style={{borderColor: fieldErrors.username ? '#dc2626' : ''}} required />
                {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{borderColor: fieldErrors.password ? '#dc2626' : ''}} required />
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </label>
              <button type="submit" className="btn primary">Login</button>
              {error && <div className="error">{error}</div>}
            </form>
          )}

          {tab === 'register' && (
            <form className="form-grid" onSubmit={onRegister}>
              <label>
                <span>Username</span>
                <input value={rUsername} onChange={e => setRUsername(e.target.value)} style={{borderColor: rFieldErrors.username ? '#dc2626' : ''}} required />
                {rFieldErrors.username && <span className="field-error">{rFieldErrors.username}</span>}
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={rEmail} onChange={e => setREmail(e.target.value)} style={{borderColor: rFieldErrors.email ? '#dc2626' : ''}} required />
                {rFieldErrors.email && <span className="field-error">{rFieldErrors.email}</span>}
              </label>
              <label>
                <span>Password</span>
                <input type="password" value={rPassword} onChange={e => setRPassword(e.target.value)} style={{borderColor: rFieldErrors.password ? '#dc2626' : ''}} required />
                {rFieldErrors.password && <span className="field-error">{rFieldErrors.password}</span>}
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
              {rSuccess && <div className="success">{rSuccess}</div>}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
