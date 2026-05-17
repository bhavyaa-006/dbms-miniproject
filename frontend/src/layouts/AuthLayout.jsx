import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-72 h-72 sm:w-96 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl
                          bg-accent/10 border border-accent/20 mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">Campus L&amp;F</h1>
          <p className="text-sm text-zinc-500 mt-1">Lost &amp; Found Management System</p>
        </div>

        <div className="card">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
