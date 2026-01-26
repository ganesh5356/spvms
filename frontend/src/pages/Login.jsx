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
  // No roles in join us form - users start with no roles
  const [rPhone, setRPhone] = useState('')
  const [rLocation, setRLocation] = useState('')
  const [rCategory, setRCategory] = useState('')
  const [rError, setRError] = useState('')
  const [rSuccess, setRSuccess] = useState('')
  const [rFieldErrors, setRFieldErrors] = useState({})
  const { login } = useAuth()
  const nav = useNavigate()
  const client = createClient(() => null)
  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8082/swagger-ui.html`

  function switchTab(next) {
    setTab(next)
    nav(next === 'register' ? '/register' : '/login')
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
      
      // 🔥 Redirect logic based on roles
      const payload = JSON.parse(atob(res.token.split('.')[1]))
      const roles = payload.roles || []
      if (roles.includes('VENDOR')) {
        nav('/app/my-profile')
      } else {
        nav('/app')
      }
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
      const payload = {
        username: rUsername,
        email: rEmail,
        password: rPassword
      }
      
      await client.post('/auth/register', payload)
      setRSuccess('Account created. Please sign in.')
      setUsername(rUsername)
      setPassword('')
      setRUsername('')
      setREmail('')
      setRPassword('')

      setRPhone('')
      setRLocation('')
      setRCategory('')
      switchTab('login')
    } catch (err) {
      setRError((err.data && err.data.message) || 'Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => nav('/')} 
          style={{ 
            marginBottom: 16, 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Back to Home
        </button>
        <div className="auth-header">
          <h1 className="auth-title">SVPMS</h1>
          <p className="auth-subtitle">Supplier & Procurement System</p>
        </div>
        
        <nav className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Join Us</button>
        </nav>

        {tab === 'login' && (
          <form className="form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={onSubmit}>
            <label className="form-label">
              <span>Username</span>
              <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} style={{borderColor: fieldErrors.username ? 'var(--danger)' : ''}} required />
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </label>
            <label className="form-label">
              <span>Password</span>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{borderColor: fieldErrors.password ? 'var(--danger)' : ''}} required />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </label>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Sign In</button>
            {error && <div className="error-banner">{error}</div>}
          </form>
        )}

        {tab === 'register' && (
          <form className="form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={onRegister}>
            <label className="form-label">
              <span>Username</span>
              <input className="form-input" value={rUsername} onChange={e => setRUsername(e.target.value)} style={{borderColor: rFieldErrors.username ? 'var(--danger)' : ''}} required />
              {rFieldErrors.username && <span className="field-error">{rFieldErrors.username}</span>}
            </label>
            <label className="form-label">
              <span>Email</span>
              <input className="form-input" type="email" value={rEmail} onChange={e => setREmail(e.target.value)} style={{borderColor: rFieldErrors.email ? 'var(--danger)' : ''}} required />
              {rFieldErrors.email && <span className="field-error">{rFieldErrors.email}</span>}
            </label>
            <label className="form-label">
              <span>Password</span>
              <input className="form-input" type="password" value={rPassword} onChange={e => setRPassword(e.target.value)} style={{borderColor: rFieldErrors.password ? 'var(--danger)' : ''}} required />
              {rFieldErrors.password && <span className="field-error">{rFieldErrors.password}</span>}
            </label>
            

            <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>Create Account</button>
            {rError && <div className="error-banner">{rError}</div>}
            {rSuccess && <div className="success-banner">{rSuccess}</div>}
          </form>
        )}
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href={swaggerUrl} className="nav-link" style={{ fontSize: 12 }} target="_blank" rel="noreferrer">Developer API Documentation</a>
        </div>
      </div>
    </div>
  )
}

