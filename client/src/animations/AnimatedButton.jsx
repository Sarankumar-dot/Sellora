import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TRANSITIONS } from '@/animations/transition.js'

const AnimatedButton = forwardRef(function AnimatedButton({ children, disabled = false, ...props }, ref) {
  const shouldReduceMotion = useReducedMotion()
  const interactionProps = shouldReduceMotion || disabled
    ? {}
    : { whileHover: { opacity: 0.96, y: -1, transition: TRANSITIONS.fast }, whileTap: { opacity: 0.92, y: 0, transition: TRANSITIONS.fast } }

  return <motion.button ref={ref} disabled={disabled} {...interactionProps} {...props}>{children}</motion.button>
})

export default AnimatedButton
