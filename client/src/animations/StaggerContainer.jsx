import { motion, useReducedMotion } from 'framer-motion'
import { fadeUpVariants, staggerContainerVariants } from '@/animations/motionPresets.js'

export function StaggerContainer({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate="animate"
      className={className}
      initial={shouldReduceMotion ? false : 'initial'}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return <motion.div className={className} initial={shouldReduceMotion ? false : 'initial'} variants={fadeUpVariants}>{children}</motion.div>
}
