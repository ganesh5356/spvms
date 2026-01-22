import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function VendorsPage() {
  const { token } = useAuth()
  const client = createClient(() => token)

  const [vendors, setVendors] = useState([])
  const [q, setQ] = useState({ rating: '', location: '', category: '', compliant: '', page: 0, size: 10 })

  const [form, setForm] = useState({
    name: '', contactName: '', email: '', phone: '', address: '',
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


  function validateVendor(vendor) {
    const errors = {}
    if (!vendor.name?.trim()) errors.name = 'Vendor name is required'
    if (!vendor.contactName?.trim()) errors.contactName = 'Contact name is required'
    if (!vendor.email?.trim()) errors.email = 'Email is required'
    if (!vendor.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email format'
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
  }

  useEffect(() => { load() }, [])

  async function search() {
    const params = new URLSearchParams()
    if (q.rating) params.set('rating', Number(q.rating))
    if (q.location) params.set('location', q.location)
    if (q.category) params.set('category', q.category)
    if (q.compliant) params.set('compliant', q.compliant)
    params.set('page', q.page)
    params.set('size', q.size)

    const res = await client.get(`/api/vendors/search?${params.toString()}`)
    const list = Array.isArray(res) ? res : (res && res.content) || []
    setVendors(list)
    if (res && res.totalPages != null) setTotalPages(res.totalPages)
  }

  async function createVendor(e) {
    e.preventDefault()
    const errors = validateVendor(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    try {
      await client.post('/api/vendors', { ...form, rating: Number(form.rating) })
      setForm({
        name: '', contactName: '', email: '', phone: '', address: '',
        gstNumber: '', location: '', category: '', rating: 5, compliant: true, isActive: true
      })
      setShowCreate(false)
      await load()
    } catch (err) {
      setError(`❌ ${extractErrorMessage(err)}`)
    }
  }

  async function updateVendor(e) {
    e.preventDefault()
    const errors = validateVendor(edit)
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }
    try {
      await client.put(`/api/vendors/${edit.id}`, { ...edit, rating: Number(edit.rating) })
      setEdit(null)
      await search()
    } catch (err) {
      setEditError(`❌ ${extractErrorMessage(err)}`)
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
    await load()
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
    await load()
  } catch (err) {
    setDeleteError(extractErrorMessage(err))
    setDeleteSuccess('')
  }
}


  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Vendors</h3>
        <button className="btn" onClick={() => setShowCreate(true)}>Add Vendor</button>
      </div>

          {deleteSuccess && (
      <div style={{ marginBottom: 10, color: '#16a34a', fontWeight: 600 }}>
        ✅ {deleteSuccess}
      </div>
    )}

    {deleteError && (
      <div style={{ marginBottom: 10, color: '#dc2626', fontWeight: 600 }}>
        ❌ {deleteError}
      </div>
    )}


      {/* ✅ SUCCESS MESSAGE */}
      {successMsg && (
        <div style={{ marginBottom: 10, color: '#16a34a', fontWeight: 600 }}>
          ✅ {successMsg}
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th>
              <th>Location</th><th>Category</th><th>Rating</th>
              <th>Compliant</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.name}</td>
                <td>{v.contactName}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v.location}</td>
                <td>{v.category}</td>
                <td>{v.rating}</td>
                <td>{v.compliant ? 'Yes' : 'No'}</td>
                <td>{v.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn small" onClick={() => setEdit(v)}>Edit</button>
                    {deleteId === v.id ? (
                      <>
                        <button className="btn outline small" style={{ color: '#ff6b6b' }} onClick={() => softDeleteVendor(v.id)}>Soft Delete</button>
                        <button className="btn outline small" style={{ color: '#c92a2a' }} onClick={() => hardDeleteVendor(v.id)}>Hard Delete</button>
                        <button className="btn outline small" onClick={() => setDeleteId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn outline small" onClick={() => setDeleteId(v.id)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} title="Create Vendor" onClose={() => setShowCreate(false)}>
        <form className="form-grid" onSubmit={createVendor}>
          <label><span>Name</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{borderColor: fieldErrors.name ? '#dc2626' : ''}} required />{fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}</label>
          <label><span>Contact Name</span><input value={form.contactName} onChange={e=>setForm({...form,contactName:e.target.value})} style={{borderColor: fieldErrors.contactName ? '#dc2626' : ''}} required />{fieldErrors.contactName && <span className="field-error">{fieldErrors.contactName}</span>}</label>
          <label><span>Email</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{borderColor: fieldErrors.email ? '#dc2626' : ''}} required />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</label>
          <label><span>Phone</span><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{borderColor: fieldErrors.phone ? '#dc2626' : ''}} required />{fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}</label>
          <label><span>Address</span><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{borderColor: fieldErrors.address ? '#dc2626' : ''}} required />{fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}</label>
          <label><span>GST Number</span><input value={form.gstNumber} onChange={e=>setForm({...form,gstNumber:e.target.value})} style={{borderColor: fieldErrors.gstNumber ? '#dc2626' : ''}} required />{fieldErrors.gstNumber && <span className="field-error">{fieldErrors.gstNumber}</span>}</label>
          <label><span>Location</span><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} style={{borderColor: fieldErrors.location ? '#dc2626' : ''}} required />{fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}</label>
          <label><span>Category</span><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{borderColor: fieldErrors.category ? '#dc2626' : ''}} required />{fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}</label>
          <label><span>Rating</span><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})} style={{borderColor: fieldErrors.rating ? '#dc2626' : ''}} required />{fieldErrors.rating && <span className="field-error">{fieldErrors.rating}</span>}</label>
          <label><span>Compliant</span>
            <select value={form.compliant ? 'true':'false'} onChange={e=>setForm({...form,compliant:e.target.value==='true'})}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label><span>Active</span>
            <select value={form.isActive ? 'true':'false'} onChange={e=>setForm({...form,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <div className="modal-actions">
            <button className="btn primary">Create Vendor</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </Modal>
      {edit && (
        <form className="form-grid" onSubmit={updateVendor} style={{marginTop:12}}>
          <label><span>Name</span><input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} style={{borderColor: editErrors.name ? '#dc2626' : ''}} required />{editErrors.name && <span className="field-error">{editErrors.name}</span>}</label>
          <label><span>Contact Name</span><input value={edit.contactName} onChange={e=>setEdit({...edit,contactName:e.target.value})} style={{borderColor: editErrors.contactName ? '#dc2626' : ''}} required />{editErrors.contactName && <span className="field-error">{editErrors.contactName}</span>}</label>
          <label><span>Email</span><input type="email" value={edit.email} onChange={e=>setEdit({...edit,email:e.target.value})} style={{borderColor: editErrors.email ? '#dc2626' : ''}} required />{editErrors.email && <span className="field-error">{editErrors.email}</span>}</label>
          <label><span>Phone</span><input value={edit.phone} onChange={e=>setEdit({...edit,phone:e.target.value})} style={{borderColor: editErrors.phone ? '#dc2626' : ''}} required />{editErrors.phone && <span className="field-error">{editErrors.phone}</span>}</label>
          <label><span>Address</span><input value={edit.address} onChange={e=>setEdit({...edit,address:e.target.value})} style={{borderColor: editErrors.address ? '#dc2626' : ''}} required />{editErrors.address && <span className="field-error">{editErrors.address}</span>}</label>
          <label><span>GST Number</span><input value={edit.gstNumber} onChange={e=>setEdit({...edit,gstNumber:e.target.value})} style={{borderColor: editErrors.gstNumber ? '#dc2626' : ''}} required />{editErrors.gstNumber && <span className="field-error">{editErrors.gstNumber}</span>}</label>
          <label><span>Location</span><input value={edit.location} onChange={e=>setEdit({...edit,location:e.target.value})} style={{borderColor: editErrors.location ? '#dc2626' : ''}} required />{editErrors.location && <span className="field-error">{editErrors.location}</span>}</label>
          <label><span>Category</span><input value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})} style={{borderColor: editErrors.category ? '#dc2626' : ''}} required />{editErrors.category && <span className="field-error">{editErrors.category}</span>}</label>
          <label><span>Rating</span><input type="number" min="1" max="5" step="0.1" value={edit.rating} onChange={e=>setEdit({...edit,rating:e.target.value})} style={{borderColor: editErrors.rating ? '#dc2626' : ''}} required />{editErrors.rating && <span className="field-error">{editErrors.rating}</span>}</label>
          <label><span>Compliant</span>
            <select value={edit.compliant ? 'true':'false'} onChange={e=>setEdit({...edit,compliant:e.target.value==='true'})}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label><span>Active</span>
            <select value={edit.isActive ? 'true':'false'} onChange={e=>setEdit({...edit,isActive:e.target.value==='true'})}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
          <button className="btn primary">Update Vendor</button>
          <button type="button" className="btn outline" onClick={() => setEdit(null)}>Cancel</button>
          {editError && <div className="error" style={{gridColumn: '1 / -1'}}>{editError}</div>}
        </form>
      )}
    </div>
  )
}

