import { motion, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { pageVariants } from '@/animations/pageVariants.js'

function PageTransition() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      key={location.pathname}
      animate="animate"
      initial={shouldReduceMotion ? false : 'initial'}
      variants={pageVariants}
    >
      <Outlet />
    </motion.div>
  )
}

export default PageTransition
