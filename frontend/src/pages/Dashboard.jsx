import { useState, useEffect } from 'react'
import VendorsPage from './vendors/VendorsPage.jsx'
import PRPage from './pr/PRPage.jsx'
import POPage from './po/POPage.jsx'
import UsersPage from './users/UsersPage.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const [tab, setTab] = useState('vendors')
  const [poFilter, setPoFilter] = useState('all')
  const { hasRole, token } = useAuth()
  const client = createClient(() => token)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    vendors: 0,
    prs: 0,
    pos: 0,
    posWithAllGst: 0
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [vendorRes, prRes, poRes] = await Promise.all([
          client.get('/api/vendors').catch(() => []),
          client.get('/api/pr').catch(() => []),
          client.get('/api/po').catch(() => [])
        ])

        const posWithAllGstCount = Array.isArray(poRes)
          ? poRes.filter(po =>
              po.cgstAmount > 0 &&
              po.sgstAmount > 0 &&
              po.igstAmount > 0
            ).length
          : 0

        setStats({
          vendors: Array.isArray(vendorRes) ? vendorRes.length : 0,
          prs: Array.isArray(prRes) ? prRes.length : 0,
          pos: Array.isArray(poRes) ? poRes.length : 0,
          posWithAllGst: posWithAllGstCount
        })
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }

    loadStats()
  }, [])

  return (
    <section className="view">

      {/* ===== DASHBOARD HEADER ACTION ===== */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 15 }}>
        <button
          className="btn primary"
          onClick={() => navigate('/app/reports')}
        >
          Download Reports
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="dashboard-stats">
        <div className="stat-card-dashboard" onClick={() => setTab('vendors')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <div className="stat-value">{stats.vendors}</div>
            <div className="stat-name">Vendors</div>
          </div>
        </div>

        <div className="stat-card-dashboard" onClick={() => setTab('pr')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.prs}</div>
            <div className="stat-name">Requisitions</div>
          </div>
        </div>

        <div
          className="stat-card-dashboard"
          onClick={() => { setTab('po'); setPoFilter('all') }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pos}</div>
            <div className="stat-name">Orders</div>
          </div>
        </div>

        <div
          className="stat-card-dashboard"
          onClick={() => { setTab('po'); setPoFilter('gst') }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.posWithAllGst}</div>
            <div className="stat-name">POs with All GST</div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <nav className="tabs">
        <button className={`tab ${tab === 'vendors' ? 'active' : ''}`} onClick={() => setTab('vendors')}>
          Vendors
        </button>
        <button className={`tab ${tab === 'pr' ? 'active' : ''}`} onClick={() => setTab('pr')}>
          Requisitions
        </button>
        <button
          className={`tab ${tab === 'po' ? 'active' : ''}`}
          onClick={() => { setTab('po'); setPoFilter('all') }}
        >
          Orders
        </button>
        {hasRole('ADMIN') && (
          <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            Users
          </button>
        )}
      </nav>

      {/* ===== TAB CONTENT ===== */}
      <div className="tab-panels">
        {tab === 'vendors' && <VendorsPage />}
        {tab === 'pr' && <PRPage />}
        {tab === 'po' && <POPage filter={poFilter} onFilterChange={setPoFilter} />}
        {tab === 'users' && hasRole('ADMIN') && <UsersPage />}
      </div>

    </section>
  )
}
