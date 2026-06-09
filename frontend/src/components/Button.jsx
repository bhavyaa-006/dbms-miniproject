import React from 'react'

export default function Button({ children, variant='primary', className='', ...props }){
  const base = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-danger'
  return (
    <button className={`${base} ${className}`} {...props}>{children}</button>
  )
}
