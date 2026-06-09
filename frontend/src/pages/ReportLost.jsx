import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategories, createLostItem, getApiErrorMessage } from '../services/itemService'
import { useToast } from '../context/ToastContext'
import PageState from '../components/PageState'
import { Upload, Terminal } from 'lucide-react'

export default function ReportLost() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [categoryValidationError, setCategoryValidationError] = useState('')
  const categoryUnavailable = !categoryLoading && !categoryError && categories.length === 0
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', location: '', date_lost: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      setCategoryLoading(true)
      setCategoryError('')
      try {
        const res = await getCategories()
        setCategories(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Failed to load categories:', err?.response?.data || err)
        setCategoryError(err.response?.data?.detail || err.response?.data?.message || 'FAILED_TO_LOAD_CATEGORIES')
      } finally {
        setCategoryLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleImage = e => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category_id) {
      setCategoryValidationError('CATEGORY_REQUIRED')
      return
    }
    if (categoryLoading || categoryError || categoryUnavailable) {
      addToast('CATEGORIES_UNAVAILABLE', 'error')
      return
    }
    setCategoryValidationError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => { if (value) fd.append(key, value) })
      if (image) fd.append('image', image)

      if (!form.title || !form.date_lost || !form.category_id) {
        addToast('MISSING_REQUIRED_FIELDS', 'error')
        return
      }

      await createLostItem(fd)
      addToast('REPORT_SUBMITTED_SUCCESSFULLY', 'success')
      navigate('/lost-items')
    } catch (error) {
      console.error('Lost item submit failed:', error?.response?.data || error)
      addToast(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        getApiErrorMessage(error) ||
        'REPORT_SUBMISSION_FAILED',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="bg-surface-2 border-2 border-border p-4 shadow-pixel-sm">
        <h1 className="text-xl font-pixel text-text-primary drop-shadow-[1px_1px_0px_#000]">INITIATE_LOST_PROTOCOL</h1>
        <p className="text-sm font-vt text-accent-secondary mt-1 tracking-widest uppercase">&gt; Submit details to the lost item registry.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        {categoryUnavailable && (
          <PageState
            compact
            icon={Terminal}
            title="NO CATEGORIES AVAILABLE"
            description="Initialize categories database before proceeding."
          />
        )}

        {categoryError && (
          <div className="bg-danger/20 border-2 border-danger p-3 text-xs font-vt uppercase tracking-widest text-danger">
            [ SYSTEM_ERROR: {categoryError} ]
          </div>
        )}

        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; TARGET_IDENTIFIER (TITLE) *</label>
          <input name="title" required value={form.title} onChange={handleChange}
            placeholder="ENTER TITLE" className="input uppercase" />
        </div>

        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; TARGET_DESCRIPTION</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange}
            placeholder="ENTER DESCRIPTION" className="input resize-none uppercase" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; CATEGORY_CLASS *</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={(e) => { handleChange(e); setCategoryValidationError('') }}
              className="input uppercase bg-surface"
              disabled={categoryLoading || !!categoryError || categoryUnavailable}
              required
            >
              <option value="">{categoryLoading ? 'LOADING...' : 'SELECT_CLASS'}</option>
              {Array.isArray(categories) && categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {categoryValidationError && <p className="mt-1 text-xs font-vt text-danger">{categoryValidationError}</p>}
          </div>
          <div>
            <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; TIME_LOST *</label>
            <input name="date_lost" type="date" required value={form.date_lost} onChange={handleChange} className="input uppercase" />
          </div>
        </div>

        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; LAST_KNOWN_LOCATION</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="ENTER LOCATION" className="input uppercase" />
        </div>

        <div>
          <label className="label text-accent drop-shadow-[1px_1px_0px_#000]">&gt; VISUAL_DATA_UPLOAD</label>
          <label className="flex flex-col items-center gap-3 py-8 border-2 border-dashed border-border bg-background
                             cursor-pointer hover:border-accent hover:bg-surface transition-colors shadow-pixel-sm hover:shadow-none hover:translate-y-[2px]">
            {preview
              ? <img src={preview} alt="preview" className="h-32 w-auto object-contain border-2 border-border" />
              : <><Upload size={24} className="text-accent" /><span className="text-sm font-vt tracking-widest uppercase text-text-secondary">CLICK TO UPLOAD IMAGE DATA</span></>
            }
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-4 pt-4 border-t-2 border-border sm:flex-row">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">ABORT</button>
          <button type="submit" disabled={loading || categoryUnavailable} className="btn-primary flex-1 border-danger bg-danger/20 hover:bg-danger text-danger hover:text-white shadow-pixel-danger">
            {loading ? 'UPLOADING...' : 'EXECUTE_REPORT'}
          </button>
        </div>
      </form>
    </div>
  )
}
