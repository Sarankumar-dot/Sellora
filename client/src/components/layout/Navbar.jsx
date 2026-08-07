import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.js'

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link className="font-serif text-2xl font-semibold tracking-[-0.055em] text-slate-950" to={ROUTES.home}>Sellora</Link>
        <span className="text-sm text-slate-500">E-commerce platform</span>
      </nav>
    </header>
  )
}

export default Navbar
