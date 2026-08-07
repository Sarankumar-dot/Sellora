import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.js'

function Logo({ className = '' }) {
  return (
    <Link aria-label="Sellora home" className={`inline-flex font-serif text-[1.7rem] font-semibold leading-none tracking-[-0.055em] text-slate-950 transition-opacity hover:opacity-75 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${className}`} to={ROUTES.home}>
      Sellora
    </Link>
  )
}

export default Logo
