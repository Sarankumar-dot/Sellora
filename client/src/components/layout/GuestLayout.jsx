import { Outlet } from 'react-router-dom'

function GuestLayout() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa] px-4 py-8 sm:px-6 sm:py-10">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(226,232,240,0.72),_transparent_70%)]" />
      <div className="relative flex w-full justify-center"><Outlet /></div>
    </main>
  )
}

export default GuestLayout
