import { Search } from 'lucide-react'

export default function SearchFilter({ search, onSearch, category, onCategory, status, onStatus, categories, statusOptions }) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          id="search-input"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="input pl-8 py-2 text-sm"
        />
      </div>

      {/* Category filter */}
      {categories && (
        <select
          id="category-filter"
          value={category}
          onChange={e => onCategory(e.target.value)}
          className="input py-2 text-sm w-auto min-w-36"
        >
          <option value="">All Categories</option>
          {categories.map(categoryName => (
            <option key={categoryName} value={categoryName}>{categoryName}</option>
          ))}
        </select>
      )}

      {/* Status filter */}
      {statusOptions && (
        <select
          id="status-filter"
          value={status}
          onChange={e => onStatus(e.target.value)}
          className="input py-2 text-sm w-auto min-w-32"
        >
          <option value="">All Status</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  )
}
