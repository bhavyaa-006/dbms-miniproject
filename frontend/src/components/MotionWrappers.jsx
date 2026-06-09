import { motion } from 'framer-motion'
import React from 'react'

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 8, scale: 0.995 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.36, ease: [0.2,0.9,0.3,1] } } }

export function MotionGrid({ children, className='' }){
  return (
    <motion.div className={className || 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} variants={container} initial="hidden" animate="visible">
      {children}
    </motion.div>
  )
}

export function MotionItem({ children, className='' }){
  return (
    <motion.div variants={item} className={className}>{children}</motion.div>
  )
}

const listContainer = { hidden:{}, visible:{ transition:{ staggerChildren: 0.05 } } }
export function MotionList({ children, className='' }){
  return (<motion.div className={className} variants={listContainer} initial="hidden" animate="visible">{children}</motion.div>)
}
export function MotionListItem({ children, className='' }){
  return (<motion.div variants={item} className={className}>{children}</motion.div>)
}

export default null
