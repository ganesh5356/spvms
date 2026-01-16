import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Landing from './pages/Landing.jsx'

function LandingHeader() {
  const { token, logout } = useAuth()
  const nav = useNavigate()
  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <Link to="/" className="brand-link">
          <div className="brand">
            <span className="logo">SVPMS</span>
            <span className="subtitle">Supplier & Procurement</span>
          </div>
        </Link>
        <nav className="landing-nav">
          {!token && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
              <Link to="/login" className="btn primary small">Get Started</Link>
            </>
          )}
          {token && (
            <>
              <Link to="/app" className="btn outline small">Dashboard</Link>
              <button className="btn outline small" onClick={() => { logout(); nav('/') }}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function Header() {
  const { token, logout } = useAuth()
  const nav = useNavigate()
  return (
    <header className="app-header">
      <Link to="/" className="brand-link">
        <div className="brand">
          <span className="logo">SVPMS</span>
          <span className="subtitle">Supplier & Procurement</span>
        </div>
      </Link>
      <nav className="header-nav">
        {!token && (
          <>
            <Link to="/login" className="btn outline small">Login</Link>
            <Link to="/register" className="btn outline small">Register</Link>
          </>
        )}
        {token && (
          <>
            <Link to="/app" className="btn outline small">Dashboard</Link>
            <button className="btn outline small" onClick={() => { logout(); nav('/') }}>Logout</button>
          </>
        )}
      </nav>
    </header>
  )
}

function PrivateRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  return (
    <AuthProvider>
      <div className="app">
        {isLanding ? <LandingHeader /> : <Header />}
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login initialTab="register" />} />
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
