import { Search } from 'lucide-react'

export default function SearchFilter({ search, onSearch, categoryId, onCategory, status, onStatus, categories, statusOptions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {/* Search */}
      <div className="relative w-full min-w-0 flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
        <input
          id="search-input"
          type="text"
          placeholder="SEARCH.EXE"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="input w-full pl-10 py-2.5 shadow-pixel-sm font-vt tracking-widest uppercase focus:shadow-none focus:translate-y-[2px]"
        />
      </div>

      {/* Category filter */}
      {Array.isArray(categories) && (
        <select
          id="category-filter"
          value={categoryId}
          onChange={e => onCategory(e.target.value)}
          className="input w-full py-2.5 sm:w-auto sm:min-w-40 shadow-pixel-sm font-vt tracking-widest uppercase focus:shadow-none focus:translate-y-[2px] bg-surface"
        >
          <option value="">ALL_CATEGORIES</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      )}

      {/* Status filter */}
      {Array.isArray(statusOptions) && (
        <select
          id="status-filter"
          value={status}
          onChange={e => onStatus(e.target.value)}
          className="input w-full py-2.5 sm:w-auto sm:min-w-36 shadow-pixel-sm font-vt tracking-widest uppercase focus:shadow-none focus:translate-y-[2px] bg-surface"
        >
          <option value="">ALL_STATUS</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}
    </div>
  )
}
