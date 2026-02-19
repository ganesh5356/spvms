import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import Modal from '../../components/Modal.jsx'

export default function UsersPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username: '', email: '', password: '', isActive: true, roles: [] })
  const [fieldErrors, setFieldErrors] = useState({})
  const [edit, setEdit] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('admin')
  const [pendingRequests, setPendingRequests] = useState([])
  const [viewRequest, setViewRequest] = useState(null)

  async function load() {
    try {
      const [userData, requestsData] = await Promise.all([
        client.get('/api/users'),
        client.get('/api/role-requests/pending').catch(() => [])
      ])
      setUsers(userData)
      setPendingRequests(requestsData)
    } catch (err) {
      console.error("Failed to load users/requests:", err)
    }
  }

  useEffect(() => { load() }, [])

  async function handleApprove(id) {
    if (window.confirm('Approve this role request?')) {
      await client.post(`/api/role-requests/${id}/approve`)
      await load()
    }
  }

  async function handleReject(id) {
    if (window.confirm('Reject this role request?')) {
      await client.post(`/api/role-requests/${id}/reject`)
      await load()
    }
  }

  const validateUser = (userData, isEdit = false) => {
    const errors = {};
    if (!userData.username?.trim()) errors.username = 'Username is required';
    if (!userData.email?.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userData.email)) errors.email = 'Invalid email address';

    if (!isEdit && (!userData.password || userData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (userData.roles.length === 0) errors.roles = 'Assign at least one role';
    return errors;
  };

  async function createUser(e) {
    e.preventDefault()
    const errors = validateUser(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    await client.post('/api/users', { ...form })
    setForm({ username: '', email: '', password: '', isActive: true, roles: [] })
    setFieldErrors({})
    setShowCreate(false)
    await load()
  }

  // Helper to check if a user has a pending request
  const getPendingRole = (userId) => {
    const req = pendingRequests.find(r => r.user?.id === userId);
    return req ? req.requestedRole : null;
  };

  // Group users by roles
  const groupedUsers = {
    users: users.filter(user => !user.roles || user.roles.length === 0),
    admin: users.filter(user => user.roles && user.roles.includes('ADMIN')),
    procurement: users.filter(user => user.roles && user.roles.includes('PROCUREMENT')),
    finance: users.filter(user => user.roles && user.roles.includes('FINANCE')),
    vendor: users.filter(user => user.roles && user.roles.includes('VENDOR')),
  };

  const tabs = [
    { id: 'admin', label: 'Administrators', count: groupedUsers.admin.length, color: 'primary' },
    { id: 'procurement', label: 'Procurement', count: groupedUsers.procurement.length, color: 'info' },
    { id: 'finance', label: 'Finance', count: groupedUsers.finance.length, color: 'warning' },
    { id: 'vendor', label: 'Vendors', count: groupedUsers.vendor.length, color: 'success' },
    { id: 'users', label: 'No Role', count: groupedUsers.users.length, color: 'secondary' },
    { id: 'requests', label: 'Pending Requests', count: pendingRequests.length, color: 'danger' }
  ];

  const renderRequestsTable = () => (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <h2 className="section-title">Pending Role Requests ({pendingRequests.length})</h2>
      </div>
      {pendingRequests.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Requested Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.user?.username || 'Unknown'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.user?.email || 'N/A'}</div>
                  </td>
                  <td><span className={`badge badge-${req.requestedRole === 'ADMIN' ? 'primary' : 'info'}`}>{req.requestedRole}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-small" onClick={() => setViewRequest(req)}>View Details</button>
                      <button className="btn btn-success btn-small" onClick={() => handleApprove(req.id)}>Approve</button>
                      <button className="btn btn-danger btn-small" onClick={() => handleReject(req.id)}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No pending role requests
        </div>
      )}
    </div>
  );

  const renderUserTable = (usersList) => (
    <div className="panel animate-fade-in">
      <div className="panel-header">
        <h2 className="section-title">{tabs.find(t => t.id === activeTab)?.label} ({usersList.length} user{usersList.length !== 1 ? 's' : ''})</h2>
      </div>
      {usersList.length > 0 ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Role Status</th><th>Account</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {usersList.map(u => {
                const pendingRole = getPendingRole(u.id);
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.username}</div>
                      {pendingRole && (
                        <div className="badge badge-error" style={{ fontSize: '0.7rem', marginTop: '4px', textTransform: 'uppercase' }}>
                          Pending: {pendingRole}
                        </div>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map(r => <span key={r} className="badge badge-info" style={{ fontSize: '0.75rem' }}>{r}</span>)
                        ) : (
                          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>NO ROLE</span>
                        )}
                      </div>
                    </td>
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
                        <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)' }} onClick={async () => { if (window.confirm('Delete user?')) { await client.del(`/api/users/${u.id}`); await load() } }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      <div className="tabs-scroll-wrapper" style={{
        overflowX: 'auto',
        marginBottom: '20px',
        borderBottom: '2px solid var(--border-color)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <div className="tabs-container" style={{
          display: 'flex',
          gap: '4px',
          minWidth: 'max-content'
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
                fontSize: '15px',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'requests' ? renderRequestsTable() : renderUserTable(groupedUsers[activeTab])}
      </div>

      <Modal open={showCreate} title="Create New User" onClose={() => { setShowCreate(false); setFieldErrors({}); }}>
        <form className="form-grid" onSubmit={createUser}>
          <label className="form-label">
            <span>Username</span>
            <input className={`form-input ${fieldErrors.username ? 'is-invalid' : ''}`} value={form.username} onChange={e => { setForm({ ...form, username: e.target.value }); if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' }); }} required />
            {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
          </label>
          <label className="form-label">
            <span>Email</span>
            <input className={`form-input ${fieldErrors.email ? 'is-invalid' : ''}`} type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }} required />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </label>
          <label className="form-label">
            <span>Password</span>
            <input className={`form-input ${fieldErrors.password ? 'is-invalid' : ''}`} type="password" value={form.password} onChange={e => { setForm({ ...form, password: e.target.value }); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }} required />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </label>
          <label className="form-label"><span>Active Status</span>
            <select className="form-select" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
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
                      let newRoles = [...form.roles];
                      if (e.target.checked) newRoles.push(role);
                      else newRoles = newRoles.filter(r => r !== role);
                      setForm({ ...form, roles: newRoles });
                      if (fieldErrors.roles) setFieldErrors({ ...fieldErrors, roles: '' });
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
            {fieldErrors.roles && <span className="field-error">{fieldErrors.roles}</span>}
          </label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setShowCreate(false); setFieldErrors({}); }}>Cancel</button>
            <button className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      {viewRequest && (
        <Modal open={!!viewRequest} title="Request Details" onClose={() => setViewRequest(null)}>
          <div className="request-details">
            <div className="section-group">
              <h3 className="section-subtitle">Account Information</h3>
              <div className="detail-item"><strong>Username:</strong> {viewRequest.user?.username || 'Unknown'}</div>
              <div className="detail-item"><strong>Account Email:</strong> {viewRequest.user?.email || 'N/A'}</div>
              <div className="detail-item"><strong>Requested Role:</strong> <span className="badge badge-info">{viewRequest.requestedRole}</span></div>
            </div>

            <div className="section-group" style={{ marginTop: '20px' }}>
              <h3 className="section-subtitle">Profile Details</h3>
              <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="detail-item"><strong>Full Name:</strong> {viewRequest.fullName}</div>
                <div className="detail-item"><strong>Contact Email:</strong> {viewRequest.email}</div>
                <div className="detail-item"><strong>Phone:</strong> {viewRequest.phoneNumber}</div>
                {viewRequest.requestedRole === 'VENDOR' && (
                  <>
                    <div className="detail-item"><strong>Location:</strong> {viewRequest.location}</div>
                    <div className="detail-item"><strong>Category:</strong> {viewRequest.category}</div>
                    <div className="detail-item"><strong>GST Number:</strong> {viewRequest.gstNumber}</div>
                    <div className="detail-item"><strong>Rating:</strong> {viewRequest.rating}</div>
                    <div className="detail-item" style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {viewRequest.address}</div>
                  </>
                )}
              </div>
              <div className="detail-item" style={{ marginTop: '10px' }}>
                <strong>Additional Details:</strong>
                <p style={{ marginTop: '5px', padding: '10px', backgroundColor: 'var(--panel-bg)', borderRadius: '4px' }}>
                  {viewRequest.additionalDetails || 'No additional details provided'}
                </p>
              </div>
            </div>

            <div className="section-group" style={{ marginTop: '20px', textAlign: 'center' }}>
              <a
                href={`/api/role-requests/document/${viewRequest.id}?token=${token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Uploaded Document
              </a>
            </div>

            <div className="modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-danger" onClick={() => { handleReject(viewRequest.id); setViewRequest(null); }}>Reject</button>
              <button className="btn btn-success" onClick={() => { handleApprove(viewRequest.id); setViewRequest(null); }}>Approve</button>
              <button className="btn btn-secondary" onClick={() => setViewRequest(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {edit && (
        <Modal open={!!edit} title="Edit User" onClose={() => { setEdit(null); setFieldErrors({}); }}>
          <form className="form-grid" onSubmit={async e => {
            e.preventDefault()
            const errors = validateUser(edit, true);
            if (Object.keys(errors).length > 0) {
              setFieldErrors(errors);
              return;
            }
            await client.put(`/api/users/${edit.id}`, {
              ...edit,
              roles: edit.roles || []
            })
            setEdit(null)
            setFieldErrors({})
            await load()
          }}>
            <label className="form-label">
              <span>Username</span>
              <input className={`form-input ${fieldErrors.username ? 'is-invalid' : ''}`} value={edit.username} onChange={e => { setEdit({ ...edit, username: e.target.value }); if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: '' }); }} required />
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </label>
            <label className="form-label">
              <span>Email</span>
              <input className={`form-input ${fieldErrors.email ? 'is-invalid' : ''}`} type="email" value={edit.email} onChange={e => { setEdit({ ...edit, email: e.target.value }); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' }); }} required />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </label>
            <label className="form-label">
              <span>Password (Leave blank to keep same)</span>
              <input className={`form-input ${fieldErrors.password ? 'is-invalid' : ''}`} type="password" value={edit.password || ''} onChange={e => { setEdit({ ...edit, password: e.target.value }); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' }); }} />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </label>
            <label className="form-label"><span>Active Status</span>
              <select className="form-select" value={edit.isActive ? 'true' : 'false'} onChange={e => setEdit({ ...edit, isActive: e.target.value === 'true' })}>
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
                        let newRoles = [...(edit.roles || [])];
                        if (e.target.checked) newRoles.push(role);
                        else newRoles = newRoles.filter(r => r !== role);
                        setEdit({ ...edit, roles: newRoles });
                        if (fieldErrors.roles) setFieldErrors({ ...fieldErrors, roles: '' });
                      }}
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.roles && <span className="field-error">{fieldErrors.roles}</span>}
            </label>
            <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn btn-outline" onClick={() => { setEdit(null); setFieldErrors({}); }}>Cancel</button>
              <button className="btn btn-primary">Update User</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
