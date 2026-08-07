import { forwardRef } from 'react'
import AnimatedButton from '@/animations/AnimatedButton.jsx'
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx'

const variants = {
  primary: 'bg-slate-950 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-950',
  secondary: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-950',
}

const Button = forwardRef(function Button(
  { children, className = '', disabled = false, isLoading = false, type = 'button', variant = 'primary', ...props },
  ref
) {
  return (
    <AnimatedButton
      ref={ref}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      type={type}
      {...props}
    >
      {isLoading && <LoadingSpinner className="size-4" />}
      {children}
    </AnimatedButton>
  )
})

export default Button
