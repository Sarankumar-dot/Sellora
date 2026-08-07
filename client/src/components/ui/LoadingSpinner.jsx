function LoadingSpinner({ className = '' }) {
  return <span aria-label="Loading" className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} role="status" />
}

export default LoadingSpinner
