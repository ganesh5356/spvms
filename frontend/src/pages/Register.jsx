import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createClient } from '../api/client.js'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  // No roles in signup - users start with no roles
  const nav = useNavigate()
  const client = createClient(() => null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await client.post('/auth/register', { username, email, password })
      if (res && res.token) {
        nav('/login')
      } else {
        nav('/login')
      }
    } catch (err) {
      setError((err.data && err.data.message) || 'Registration failed')
    }
  }

  return (
    <section className="card view">
      <h2>Create Account</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          <span>Username</span>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn primary">Register</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div className="muted-row">
        <span>Already have an account?</span> <Link to="/login">Login</Link>
      </div>
    </section>
  )
}
