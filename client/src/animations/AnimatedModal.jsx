import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { backdropVariants, modalVariants } from '@/animations/motionPresets.js'

function AnimatedModal({ children, isOpen, onClose }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate="animate"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={shouldReduceMotion ? false : 'initial'}
          role="dialog"
        >
          <motion.button
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-slate-950/20"
            onClick={onClose}
            type="button"
            variants={backdropVariants}
          />
          <motion.div className="relative w-full max-w-lg" variants={modalVariants}>{children}</motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AnimatedModal
