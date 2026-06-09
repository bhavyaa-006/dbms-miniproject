import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-72 h-72 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative w-full max-w-sm z-10 animate-float">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm
                          bg-surface border-2 border-accent mb-4 shadow-pixel-accent">
            <span className="text-3xl">👾</span>
          </div>
          <h1 className="text-2xl font-pixel text-accent drop-shadow-[2px_2px_0px_#000]">Campus L&amp;F</h1>
          <p className="text-xl font-vt text-text-secondary mt-3 tracking-widest uppercase">System Boot Sequence...</p>
        </div>

        <div className="card shadow-pixel-md border-2 border-border bg-surface-2 relative p-0 overflow-hidden">
           {/* Retro Window Header */}
           <div className="h-8 bg-border flex items-center justify-between px-3 border-b-2 border-background">
             <div className="flex space-x-2">
               <div className="w-3 h-3 rounded-none bg-danger shadow-pixel-sm"></div>
               <div className="w-3 h-3 rounded-none bg-accent-secondary shadow-pixel-sm"></div>
               <div className="w-3 h-3 rounded-none bg-success shadow-pixel-sm"></div>
             </div>
             <div className="text-xs font-vt text-text-secondary">LOGIN.EXE</div>
           </div>
           <div className="p-6">
             <Outlet />
           </div>
        </div>
      </div>
    </div>
  )
}
