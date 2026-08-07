function Alert({ children, variant = 'error' }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-slate-200 bg-slate-50 text-slate-700',
    success: 'border-green-200 bg-green-50 text-green-800',
  }

  return <div className={`rounded-xl border px-3.5 py-3 text-sm ${styles[variant]}`} role="alert">{children}</div>
}

export default Alert
