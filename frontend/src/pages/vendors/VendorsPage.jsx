import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function VendorsPage() {
  const { token, hasRole } = useAuth()
  const client = createClient(() => token)

  const [vendors, setVendors] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [q, setQ] = useState({ rating: '', location: '', category: '', isActive: '', page: 0, size: 10 })
  const [filters, setFilters] = useState({ rating: '', location: '', category: '', isActive: '' })

  const [form, setForm] = useState({
    userId: '', name: '', contactName: '', email: '', phone: '', address: '',
    gstNumber: '', location: '', category: '', rating: 5, compliant: true, isActive: true
  })


  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [editError, setEditError] = useState('')
  const [edit, setEdit] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState(null)




  /* ---------------- SUCCESS MESSAGE AUTO HIDE ---------------- */
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  useEffect(() => {
    if (deleteSuccess || deleteError) {
      const t = setTimeout(() => {
        setDeleteSuccess('')
        setDeleteError('')
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [deleteSuccess, deleteError])


  function validateVendor(vendor, isEdit = false) {
    const errors = {}
    if (!isEdit && !vendor.userId) errors.userId = 'User account is required'
    // If name/email are provided, they must be valid, but they are optional if userId is set
    if (!vendor.userId) {
      if (!vendor.name?.trim()) errors.name = 'Vendor name is required'
      if (!vendor.contactName?.trim()) errors.contactName = 'Contact name is required'
      if (!vendor.email?.trim()) errors.email = 'Email is required'
      if (!vendor.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email format'
    }

    if (!vendor.phone?.trim()) errors.phone = 'Phone number is required'
    if (!vendor.address?.trim()) errors.address = 'Address is required'
    if (!vendor.gstNumber?.trim()) errors.gstNumber = 'GST number is required'
    if (!vendor.location?.trim()) errors.location = 'Location is required'
    if (!vendor.category?.trim()) errors.category = 'Category is required'
    if (vendor.rating < 1 || vendor.rating > 5) errors.rating = 'Rating must be between 1 and 5'
    return errors
  }

  async function load() {
    const params = new URLSearchParams()
    params.set('page', q.page)
    params.set('size', q.size)
    const res = await client.get(`/api/vendors/search?${params.toString()}`)
    const list = Array.isArray(res) ? res : (res && res.content) || []
    setVendors(list)
    if (res && res.totalPages != null) setTotalPages(res.totalPages)
    if (res && res.totalElements != null) {
      window.totalElements = res.totalElements; // Store total count globally for display
    }
  }

  async function fetchUsers() {
    try {
      const users = await client.get('/api/users/no-roles')
      setAvailableUsers(users)
    } catch (err) {
      console.error('Failed to fetch users with no roles', err)
    }
  }


  useEffect(() => {
    search()
    if (hasRole('ADMIN') || hasRole('PROCUREMENT')) {
      fetchUsers()
    }
  }, [])

  // Reload when pagination changes
  useEffect(() => { search() }, [q.page, q.size])

  async function search() {
    const params = new URLSearchParams()
    if (q.rating) params.set('rating', Number(q.rating))
    if (q.location) params.set('location', q.location)
    if (q.category) params.set('category', q.category)
    if (q.isActive !== '') params.set('isActive', q.isActive)
    params.set('page', q.page)
    params.set('size', q.size)

    const res = await client.get(`/api/vendors/search?${params.toString()}`)
    const list = Array.isArray(res) ? res : (res && res.content) || []
    setVendors(list)
    if (res && res.totalPages != null) setTotalPages(res.totalPages)
    if (res && res.totalElements != null) {
      window.totalElements = res.totalElements; // Store total count globally for display
    }
  }

  async function createVendor(e) {
    e.preventDefault()
    const errors = validateVendor(form, false)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    try {
      await client.post('/api/vendors', { ...form, userId: form.userId ? Number(form.userId) : null, rating: Number(form.rating) })
      setForm({
        userId: '', name: '', contactName: '', email: '', phone: '', address: '',
        gstNumber: '', location: '', category: '', rating: 5, compliant: true, isActive: true
      })
      setShowCreate(false)
      await search()
    } catch (err) {
      setError(` ${extractErrorMessage(err)}`)
    }
  }

  async function updateVendor(e) {
    e.preventDefault()
    const errors = validateVendor(edit, true)
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }
    try {
      await client.put(`/api/vendors/${edit.id}`, { ...edit, userId: edit.userId ? Number(edit.userId) : null, rating: Number(edit.rating) })
      setEdit(null)
      await search()
    } catch (err) {
      setEditError(` ${extractErrorMessage(err)}`)
    }
  }


  /* ---------------- DELETE WITH SUCCESS MESSAGE ---------------- */

  async function softDeleteVendor(id) {
    if (!window.confirm('Soft delete this vendor?')) return
    try {
      await client.del(`/api/vendors/${id}`)
      setDeleteSuccess('Vendor soft deleted successfully')
      setDeleteError('')
      setDeleteId(null)
      await search()
    } catch (err) {
      setDeleteError(extractErrorMessage(err))
      setDeleteSuccess('')
    }
  }


  async function hardDeleteVendor(id) {
    if (!window.confirm('⚠️ Hard delete this vendor? This action cannot be undone!')) return
    try {
      await client.del(`/api/vendors/${id}/hard`)
      setDeleteSuccess('Vendor permanently deleted successfully')
      setDeleteError('')
      setDeleteId(null)
      await search()
    } catch (err) {
      setDeleteError(extractErrorMessage(err))
      setDeleteSuccess('')
    }
  }


  return (
    <div className="vendors-container">
      <header className="page-header">
        <h1 className="page-title">Vendor Management</h1>
        {(hasRole('ADMIN') || hasRole('PROCUREMENT')) && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Add Vendor
          </button>
        )}
      </header>

      {deleteSuccess && <div className="success-banner">✅ {deleteSuccess}</div>}
      {deleteError && <div className="error-banner">❌ {deleteError}</div>}
      {successMsg && <div className="success-banner">✅ {successMsg}</div>}

      {/* Search Filters */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div className="panel-header">
          <h2 className="section-title">Search Vendors</h2>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '20px' }}>
          <label className="form-label">
            <span>Rating</span>
            <select className="form-select" value={q.rating} onChange={e => setQ({ ...q, rating: e.target.value, page: 0 })}>
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </label>
          <label className="form-label">
            <span>Location</span>
            <input className="form-input" value={q.location} onChange={e => setQ({ ...q, location: e.target.value, page: 0 })} placeholder="Enter location" />
          </label>
          <label className="form-label">
            <span>Category</span>
            <input className="form-input" value={q.category} onChange={e => setQ({ ...q, category: e.target.value, page: 0 })} placeholder="Enter category" />
          </label>
          <label className="form-label">
            <span>Status</span>
            <select className="form-select" value={q.isActive} onChange={e => setQ({ ...q, isActive: e.target.value, page: 0 })}>
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="btn btn-primary" onClick={search}>Search</button>
            <button className="btn btn-outline" style={{ marginLeft: '8px' }} onClick={() => {
              setQ({ rating: '', location: '', category: '', compliant: '', page: 0, size: 10 });
              search();
            }}>Clear</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">All Vendors</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td><div style={{ fontWeight: 600 }}>{v.name}</div></td>
                  <td>{v.contactName}</td>
                  <td>{v.email}</td>
                  <td>{v.phone}</td>
                  <td>{v.location}</td>
                  <td><span className="badge badge-info">{v.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⭐ {v.rating}
                    </div>
                  </td>
                  <td>
                    {v.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(hasRole('ADMIN') || hasRole('PROCUREMENT')) && (
                        <button className="btn btn-outline btn-small" onClick={() => setEdit(v)}>Edit</button>
                      )}
                      {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
                        deleteId === v.id ? (
                          <>
                            {(hasRole('ADMIN') || hasRole('PROCUREMENT') || hasRole('FINANCE')) && (
                              <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => softDeleteVendor(v.id)}>Soft</button>
                            )}
                            {hasRole('ADMIN') && (
                              <button className="btn btn-outline btn-small" style={{ color: 'var(--danger)', background: 'rgba(220, 38, 38, 0.1)' }} onClick={() => hardDeleteVendor(v.id)}>Hard</button>
                            )}
                            <button className="btn btn-outline btn-small" onClick={() => setDeleteId(null)}>Cancel</button>
                          </>
                        ) : (
                          <button className="btn btn-outline btn-small" style={{ color: 'var(--text-muted)' }} onClick={() => setDeleteId(v.id)}>Delete</button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              Showing {(q.page * q.size) + 1}-{Math.min((q.page + 1) * q.size, (q.page * q.size) + vendors.length)} of {window.totalElements || '?'} vendors
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-outline btn-small"
                disabled={q.page === 0}
                onClick={() => setQ({ ...q, page: q.page - 1 })}
              >
                Previous
              </button>

              <span style={{ padding: '0 12px', lineHeight: '32px' }}>
                Page {q.page + 1} of {totalPages}
              </span>

              <button
                className="btn btn-outline btn-small"
                disabled={q.page === totalPages - 1}
                onClick={() => setQ({ ...q, page: q.page + 1 })}
              >
                Next
              </button>
            </div>

            <div>
              <select
                className="form-select"
                value={q.size}
                onChange={e => setQ({ ...q, size: parseInt(e.target.value), page: 0 })}
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <Modal open={showCreate} title="Create New Vendor" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createVendor}>
          <label className="form-label" style={{ gridColumn: '1 / -1' }}>
            <span>Link to User (Vendor Account)</span>
            <select
              className="form-select"
              value={form.userId}
              onChange={e => setForm({ ...form, userId: e.target.value })}
              style={{ borderColor: fieldErrors.userId ? 'var(--danger)' : '' }}
              required
            >
              <option value="">-- Select a User --</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
              ))}
            </select>
            {fieldErrors.userId && <span className="field-error">{fieldErrors.userId}</span>}
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Vendor name and email will be fetched from the selected user.
            </small>
          </label>

          <label className="form-label"><span>Phone</span><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ borderColor: fieldErrors.phone ? 'var(--danger)' : '' }} required />{fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}</label>
          <label className="form-label"><span>Address</span><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ borderColor: fieldErrors.address ? 'var(--danger)' : '' }} required />{fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}</label>
          <label className="form-label"><span>GST Number</span><input className="form-input" value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} style={{ borderColor: fieldErrors.gstNumber ? 'var(--danger)' : '' }} required />{fieldErrors.gstNumber && <span className="field-error">{fieldErrors.gstNumber}</span>}</label>
          <label className="form-label"><span>Location</span><input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ borderColor: fieldErrors.location ? 'var(--danger)' : '' }} required />{fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}</label>
          <label className="form-label"><span>Category</span><input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ borderColor: fieldErrors.category ? 'var(--danger)' : '' }} required />{fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}</label>
          <label className="form-label"><span>Rating</span><input className="form-input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} style={{ borderColor: fieldErrors.rating ? 'var(--danger)' : '' }} required />{fieldErrors.rating && <span className="field-error">{fieldErrors.rating}</span>}</label>

          <label className="form-label"><span>Compliant</span>
            <select className="form-select" value={form.compliant ? 'true' : 'false'} onChange={e => setForm({ ...form, compliant: e.target.value === 'true' })}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="form-label"><span>Active</span>
            <select className="form-select" value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary">Create Vendor</button>
          </div>
          {error && <div className="error-banner" style={{ gridColumn: '1 / -1' }}>{error}</div>}
        </form>
      </Modal>

      {edit && (
        <Modal open={!!edit} title="Edit Vendor" onClose={() => setEdit(null)}>
          <form className="form-grid" onSubmit={updateVendor}>
            <label className="form-label" style={{ gridColumn: '1 / -1' }}>
              <span>Link to User (Vendor Account)</span>
              <select
                className="form-select"
                value={edit.userId || ''}
                onChange={e => setEdit({ ...edit, userId: e.target.value })}
                style={{ borderColor: editErrors.userId ? 'var(--danger)' : '' }}
                required
              >
                <option value="">-- Select a User --</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                ))}
              </select>
              {editErrors.userId && <span className="field-error">{editErrors.userId}</span>}
            </label>

            <label className="form-label"><span>Phone</span><input className="form-input" value={edit.phone} onChange={e => setEdit({ ...edit, phone: e.target.value })} style={{ borderColor: editErrors.phone ? 'var(--danger)' : '' }} required />{editErrors.phone && <span className="field-error">{editErrors.phone}</span>}</label>

            <label className="form-label"><span>Address</span><input className="form-input" value={edit.address} onChange={e => setEdit({ ...edit, address: e.target.value })} style={{ borderColor: editErrors.address ? 'var(--danger)' : '' }} required />{editErrors.address && <span className="field-error">{editErrors.address}</span>}</label>
            <label className="form-label"><span>GST Number</span><input className="form-input" value={edit.gstNumber} onChange={e => setEdit({ ...edit, gstNumber: e.target.value })} style={{ borderColor: editErrors.gstNumber ? 'var(--danger)' : '' }} required />{editErrors.gstNumber && <span className="field-error">{editErrors.gstNumber}</span>}</label>
            <label className="form-label"><span>Location</span><input className="form-input" value={edit.location} onChange={e => setEdit({ ...edit, location: e.target.value })} style={{ borderColor: editErrors.location ? 'var(--danger)' : '' }} required />{editErrors.location && <span className="field-error">{editErrors.location}</span>}</label>
            <label className="form-label"><span>Category</span><input className="form-input" value={edit.category} onChange={e => setEdit({ ...edit, category: e.target.value })} style={{ borderColor: editErrors.category ? 'var(--danger)' : '' }} required />{editErrors.category && <span className="field-error">{editErrors.category}</span>}</label>
            <label className="form-label"><span>Rating</span><input className="form-input" type="number" min="1" max="5" step="0.1" value={edit.rating} onChange={e => setEdit({ ...edit, rating: e.target.value })} style={{ borderColor: editErrors.rating ? 'var(--danger)' : '' }} required />{editErrors.rating && <span className="field-error">{editErrors.rating}</span>}</label>
            <label className="form-label"><span>Compliant</span>
              <select className="form-select" value={edit.compliant ? 'true' : 'false'} onChange={e => setEdit({ ...edit, compliant: e.target.value === 'true' })}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            <label className="form-label"><span>Active</span>
              <select className="form-select" value={edit.isActive ? 'true' : 'false'} onChange={e => setEdit({ ...edit, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn btn-primary">Update Vendor</button>
            </div>
            {editError && <div className="error-banner" style={{ gridColumn: '1 / -1' }}>{editError}</div>}
          </form>
        </Modal>
      )}
    </div>
  )
}


