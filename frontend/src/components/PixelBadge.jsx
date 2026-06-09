import React from 'react'

export default function PixelBadge({ children, color='accent', className='' }){
  const baseColor = color === 'danger' ? 'text-[--danger]' : color === 'success' ? 'text-[--success]' : 'text-[--accent]'
  return (
    <span className={`pixel-badge ${className}`} style={{background:'rgba(255,255,255,0.02)'}}>{children}</span>
  )
}
