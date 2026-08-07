import { motion, useReducedMotion } from 'framer-motion'

function Skeleton({ className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={shouldReduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
      aria-label="Loading"
      className={`rounded-md bg-slate-200 ${className}`}
      role="status"
      transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
    />
  )
}

export default Skeleton
