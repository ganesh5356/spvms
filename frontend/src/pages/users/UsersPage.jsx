import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function UsersPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', email: '', password: '', isActive: true, roles: [] })
  const [edit, setEdit] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('admin')

  async function load() {
    const res = await client.get('/api/users')
    setUsers(res)
  }
  useEffect(() => { load() }, [])

  async function createUser(e) {
    e.preventDefault()
    await client.post('/api/users', {
      ...form,
      roles: form.roles
    })
    setForm({ username:'', email:'', password:'', isActive:true, roles: [] })
    setShowCreate(false)
    await load()
  }

  // Group users by roles
  const groupedUsers = {
    users: users.filter(user => !user.roles || user.roles.length === 0),
    admin: users.filter(user => user.roles && user.roles.includes('ADMIN')),
    procurement: users.filter(user => user.roles && user.roles.includes('PROCUREMENT')),
    finance: users.filter(user => user.roles && user.roles.includes('FINANCE')),
    vendor: users.filter(user => user.roles && user.roles.includes('VENDOR')),
  };

  const tabs = [
    { id: 'users', label: 'Users', count: groupedUsers.users.length, color: 'secondary' },
    { id: 'admin', label: 'Administrators', count: groupedUsers.admin.length, color: 'primary' },
    { id: 'procurement', label: 'Procurement', count: groupedUsers.procurement.length, color: 'info' },
    { id: 'finance', label: 'Finance', count: groupedUsers.finance.length, color: 'warning' },
    { id: 'vendor', label: 'Vendors', count: groupedUsers.vendor.length, color: 'success' }
  ];

  const renderUserTable = (usersList) => (
    <div className="panel">
      <div className="panel-header">
        <h2 className="section-title">{tabs.find(t => t.id === activeTab)?.label} ({usersList.length} user{usersList.length !== 1 ? 's' : ''})</h2>
      </div>
      {usersList.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><div style={{ fontWeight: 600 }}>{u.username}</div></td>
                  <td>{u.email}</td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-small" onClick={() => setEdit({ ...u, password: '' })}>Edit</button>
                      <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)' }} onClick={async () => { if(window.confirm('Delete user?')) { await client.del(`/api/users/${u.id}`); await load() } }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No users found in this category
        </div>
      )}
    </div>
  );

  return (
    <div className="users-container">
      <header className="page-header">
        <h1 className="page-title">User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create User</button>
      </header>

      {/* Tab Navigation */}
      <div className="tabs-container" style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '20px', 
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '0'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === tab.id ? `var(--${tab.color})` : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : 'normal',
              borderBottom: activeTab === tab.id ? `3px solid var(--${tab.color})` : 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
              top: '2px',
              fontSize:'15px'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderUserTable(groupedUsers[activeTab])}
      </div>

      <Modal open={showCreate} title="Create New User" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createUser}>
          <label className="form-label"><span>Username</span><input className="form-input" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></label>
          <label className="form-label"><span>Email</span><input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
          <label className="form-label"><span>Password</span><input className="form-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>
          <label className="form-label"><span>Active Status</span>
            <select className="form-select" value={form.isActive ? 'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <label className="form-label" style={{ gridColumn: '1 / -1' }}>
            <span>Roles</span>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              {['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'].map(role => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.roles.includes(role)}
                    onChange={e => {
                      if (e.target.checked) {
                        setForm({...form, roles: [...form.roles, role]});
                      } else {
                        setForm({...form, roles: form.roles.filter(r => r !== role)});
                      }
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      {edit && (
        <Modal open={!!edit} title="Edit User" onClose={() => setEdit(null)}>
          <form className="form-grid" onSubmit={async e => {
            e.preventDefault()
            await client.put(`/api/users/${edit.id}`, {
              ...edit,
              roles: edit.roles || []
            })
            setEdit(null)
            await load()
          }}>
            <label className="form-label"><span>Username</span><input className="form-input" value={edit.username} onChange={e=>setEdit({...edit,username:e.target.value})} required /></label>
            <label className="form-label"><span>Email</span><input className="form-input" type="email" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} required /></label>
            <label className="form-label"><span>Password (Leave blank to keep same)</span><input className="form-input" type="password" value={edit.password || ''} onChange={e=>setEdit({...edit,password:e.target.value})} /></label>
            <label className="form-label"><span>Active Status</span>
              <select className="form-select" value={edit.isActive ? 'true':'false'} onChange={e=>setEdit({...edit,isActive:e.target.value==='true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <label className="form-label" style={{ gridColumn: '1 / -1' }}>
              <span>Roles</span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                {['ADMIN', 'PROCUREMENT', 'FINANCE', 'VENDOR'].map(role => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={edit.roles?.includes(role) || false}
                      onChange={e => {
                        if (e.target.checked) {
                          setEdit({...edit, roles: [...(edit.roles || []), role]});
                        } else {
                          setEdit({...edit, roles: (edit.roles || []).filter(r => r !== role)});
                        }
                      }}
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </label>
            <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn-primary">Update User</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

