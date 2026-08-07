import { TRANSITIONS } from '@/animations/transition.js'

export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TRANSITIONS.standard },
  exit: { opacity: 0, transition: TRANSITIONS.fast },
}

export const fadeUpVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: TRANSITIONS.standard },
  exit: { opacity: 0, y: 4, transition: TRANSITIONS.fast },
}

export const staggerContainerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
}

export const cardHover = {
  y: -2,
  transition: TRANSITIONS.fast,
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: TRANSITIONS.standard },
  exit: { opacity: 0, scale: 0.98, transition: TRANSITIONS.fast },
}

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TRANSITIONS.standard },
  exit: { opacity: 0, transition: TRANSITIONS.fast },
}

export const dropdownVariants = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0, transition: TRANSITIONS.fast },
  exit: { opacity: 0, y: -4, transition: TRANSITIONS.fast },
}

export const drawerVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: TRANSITIONS.standard },
  exit: { opacity: 0, x: 16, transition: TRANSITIONS.fast },
}
