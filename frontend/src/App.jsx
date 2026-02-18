import { Routes, Route, Navigate, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Landing from './pages/Landing.jsx'
import DownloadReports from './pages/DownloadReports.jsx'
import VendorsPage from './pages/vendors/VendorsPage.jsx'
import PRPage from './pages/pr/PRPage.jsx'
import POPage from './pages/po/POPage.jsx'
import UsersPage from './pages/users/UsersPage.jsx'
import VendorProfile from './pages/vendors/VendorProfile.jsx'
import VendorPO from './pages/vendors/VendorPO.jsx'
import RoleSelectionPage from './pages/RoleSelectionPage.jsx'
import ChatBot from './components/ChatBot.jsx'

function Sidebar() {
  const { hasRole, logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = () => {
    logout()
    nav('/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/app" className="sidebar-brand">
          <span className="sidebar-logo">SVPMS</span>
          <span className="sidebar-subtitle">Supplier & Procurement</span>
        </Link>
      </div>
      <nav className="sidebar-nav">
        {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
          <NavLink to="/app" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📊</span> Dashboard
          </NavLink>
        )}

        {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
          <NavLink to="/app/vendors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">🏢</span> Vendors
          </NavLink>
        )}

        {hasRole('VENDOR') && (
          <NavLink to="/app/my-profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">👤</span> My Profile
          </NavLink>
        )}

        {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
          <NavLink to="/app/pr" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📋</span> Requisitions
          </NavLink>
        )}

        {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
          <NavLink to="/app/po" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📦</span> Purchase Orders
          </NavLink>
        )}

        {hasRole('VENDOR') && (
          <NavLink to="/app/my-orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">🚚</span> My Orders
          </NavLink>
        )}

        {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
          <NavLink to="/app/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📈</span> Reports
          </NavLink>
        )}

        {hasRole('ADMIN') && (
          <NavLink to="/app/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">👥</span> User Management
          </NavLink>
        )}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="sidebar-link-icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}

function TopBar() {
  const { roles } = useAuth()
  return (
    <div className="top-bar">
      <div className="user-profile">
        <span className="user-role-badge badge badge-info">{roles[0]}</span>
        <div className="user-avatar">U</div>
      </div>
    </div>
  )
}

function AppLayout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-wrapper">
        <TopBar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function RoleRoute({ roles = [], children }) {
  const { token, hasRole } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  const allowed = roles.some(r => hasRole(r))
  if (!allowed) return <Navigate to="/app" replace />
  return <AppLayout>{children}</AppLayout>
}

function DashboardWrapper() {
  const { roles, hasRole } = useAuth()
  if (roles.length === 0) return <Navigate to="/app/select-role" replace />
  if (hasRole('VENDOR')) return <Navigate to="/app/my-profile" replace />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login initialTab="register" />} />

        <Route
          path="/app"
          element={
            <PrivateRoute>
              <DashboardWrapper />
            </PrivateRoute>
          }
        />

        <Route
          path="/app/select-role"
          element={
            <PrivateRoute>
              <RoleSelectionPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/app/vendors"
          element={
            <RoleRoute roles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
              <VendorsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/app/pr"
          element={
            <RoleRoute roles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
              <PRPage />
            </RoleRoute>
          }
        />

        <Route
          path="/app/po"
          element={
            <RoleRoute roles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
              <POPage />
            </RoleRoute>
          }
        />

        <Route
          path="/app/reports"
          element={
            <RoleRoute roles={['ADMIN', 'PROCUREMENT', 'FINANCE']}>
              <DownloadReports />
            </RoleRoute>
          }
        />

        <Route
          path="/app/users"
          element={
            <RoleRoute roles={['ADMIN']}>
              <UsersPage />
            </RoleRoute>
          }
        />

        <Route
          path="/app/my-profile"
          element={
            <RoleRoute roles={['VENDOR']}>
              <VendorProfile />
            </RoleRoute>
          }
        />

        <Route
          path="/app/my-orders"
          element={
            <RoleRoute roles={['VENDOR']}>
              <VendorPO />
            </RoleRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </AuthProvider>
  )
}

