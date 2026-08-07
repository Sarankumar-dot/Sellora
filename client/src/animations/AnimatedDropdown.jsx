import { motion, useReducedMotion } from 'framer-motion'
import { dropdownVariants } from '@/animations/motionPresets.js'

function AnimatedDropdown({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return <motion.div animate="animate" className={className} initial={shouldReduceMotion ? false : 'initial'} variants={dropdownVariants}>{children}</motion.div>
}

export default AnimatedDropdown
