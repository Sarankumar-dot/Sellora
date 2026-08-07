import { TRANSITIONS } from '@/animations/transition.js'

export const pageVariants = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0, transition: TRANSITIONS.page },
  exit: { opacity: 0, x: -8, transition: TRANSITIONS.standard },
}
