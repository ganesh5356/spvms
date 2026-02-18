import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    vendors: 0,
    prs: 0,
    pos: 0
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [vendorRes, prRes, poRes] = await Promise.all([
          client.get('/api/vendors').catch(() => []),
          client.get('/api/pr').catch(() => []),
          client.get('/api/po').catch(() => [])
        ])

        setStats({
          vendors: vendorRes?.length || 0,
          prs: prRes?.length || 0,
          pos: poRes?.length || 0
        })
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </header>

      <div className="dashboard-stats">
        <StatCard
          label="Total Vendors"
          value={stats.vendors}
          icon="🏢"
          onClick={() => navigate('/app/vendors')}
        />
        <StatCard
          label="Purchase Requisitions"
          value={stats.prs}
          icon="📋"
          onClick={() => navigate('/app/pr')}
        />
        <StatCard
          label="Purchase Orders"
          value={stats.pos}
          icon="📦"
          onClick={() => navigate('/app/po')}
        />
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">Quick Insights</h2>
        </div>
        <div className="panel-body">
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome to the Supplier & Procurement Management System. Use the sidebar to navigate through vendors, requisitions, and orders.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, onClick }) {
  return (
    <div className="stat-card-dashboard" onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-name">{label}</div>
      </div>
    </div>
  )
}

