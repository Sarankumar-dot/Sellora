import { motion, useReducedMotion } from 'framer-motion'
import { cardHover, fadeInVariants } from '@/animations/motionPresets.js'

function AnimatedCard({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      animate="animate"
      className={className}
      initial={shouldReduceMotion ? false : 'initial'}
      variants={fadeInVariants}
      whileHover={shouldReduceMotion ? undefined : cardHover}
    >
      {children}
    </motion.section>
  )
}

export default AnimatedCard
