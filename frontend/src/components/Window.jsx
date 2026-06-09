import React from 'react'

export default function Window({ title, children, className='' }){
  return (
    <div className={`card ${className} relative overflow-hidden`}> 
      <div className="scanlines" aria-hidden />
      <div className="stars" aria-hidden />
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between" style={{background:'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)'}}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-red-400" />
          <div className="w-2 h-2 rounded-sm bg-amber-400" />
          <div className="w-2 h-2 rounded-sm bg-emerald-400" />
        </div>
        <div className="text-xs text-zinc-400 font-medium">{title}</div>
        <div style={{width:36}} />
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
