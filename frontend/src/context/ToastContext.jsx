import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
    info:    'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onRemove(t.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
                      shadow-lg cursor-pointer backdrop-blur-sm max-w-xs
                      animate-in slide-in-from-right-2 duration-200
                      ${colors[t.type] || colors.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
