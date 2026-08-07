import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { backdropVariants, drawerVariants } from '@/animations/motionPresets.js'

function AnimatedDrawer({ children, isOpen, onClose }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div animate="animate" className="fixed inset-0 z-50" initial={shouldReduceMotion ? false : 'initial'}>
          <motion.button aria-label="Close panel" className="absolute inset-0 bg-slate-950/20" onClick={onClose} type="button" variants={backdropVariants} />
          <motion.aside className="absolute inset-y-0 right-0 w-full max-w-md" variants={drawerVariants}>{children}</motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedDrawer
