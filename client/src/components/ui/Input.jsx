import { forwardRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const Input = forwardRef(function Input({ endAdornment, error, id, label, ...props }, ref) {
  const describedBy = error ? `${id}-error` : undefined
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-800" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-950 outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/10 disabled:cursor-not-allowed disabled:bg-slate-50 ${endAdornment ? 'pr-11' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200'}`}
          id={id}
          {...props}
        />
        {endAdornment && <div className="absolute inset-y-0 right-3 flex items-center">{endAdornment}</div>}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
            exit={{ opacity: 0, y: -2 }}
            id={describedBy}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -2 }}
            role="alert"
            transition={{ duration: 0.16, ease: 'easeInOut' }}
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

export default Input
