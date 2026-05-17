import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, createFoundItem } from '../services/itemService'
import { useToast } from '../context/ToastContext'
import { Upload } from 'lucide-react'

export default function ReportFound() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', location: '', date_found: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => { getCategories().then(res => setCategories(res.data)) }, [])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleImage = e => {
    const file = e.target.files[0]
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    if (image) fd.append('image', image)
    try {
      await createFoundItem(fd)
      addToast('Found item reported successfully!', 'success')
      navigate('/found-items')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to submit', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Report Found Item</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Help someone get their item back by reporting it here.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Item Title *</label>
          <input name="title" required value={form.title} onChange={handleChange}
            placeholder="e.g. Blue Denim Jacket" className="input" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange}
            placeholder="Describe the item — color, brand, identifying marks..." className="input resize-none text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select name="category_id" required value={form.category_id} onChange={handleChange} className="input">
              <option value="">Select...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date Found *</label>
            <input name="date_found" type="date" required value={form.date_found} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Where did you find it?</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="e.g. Parking Lot A, Canteen Block B" className="input" />
        </div>

        <div>
          <label className="label">Image (recommended)</label>
          <label className="flex flex-col items-center gap-2 py-6 border-2 border-dashed border-white/10
                             rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
            {preview
              ? <img src={preview} alt="preview" className="h-24 w-auto rounded-lg object-contain" />
              : <><Upload size={20} className="text-zinc-500" /><span className="text-xs text-zinc-500">Click to upload image</span></>
            }
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
