import React from 'react'

export default function Section({ title, subtitle, children, className='' }){
  return (
    <section className={`${className} space-y-3`}>
      {title && <h2 className="text-2xl font-retro text-zinc-100" style={{fontFamily:'"Press Start 2P"'}}>{title}</h2>}
      {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      {children}
    </section>
  )
}
