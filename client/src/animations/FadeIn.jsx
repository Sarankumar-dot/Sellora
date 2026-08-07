import { motion, useReducedMotion } from 'framer-motion'
import { fadeUpVariants } from '@/animations/motionPresets.js'

function FadeIn({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate="animate"
      className={className}
      initial={shouldReduceMotion ? false : 'initial'}
      variants={fadeUpVariants}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn
