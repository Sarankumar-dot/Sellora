import { motion, useReducedMotion } from 'framer-motion'
import { ToastBar } from 'react-hot-toast'
import { TRANSITIONS } from '@/animations/transition.js'

function AnimatedToast({ toast }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={toast.visible || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
      transition={TRANSITIONS.standard}
    >
      <ToastBar toast={toast} />
    </motion.div>
  )
}

export default AnimatedToast
