import { Outlet } from 'react-router-dom'
import MainContainer from '@/components/common/MainContainer.jsx'
import Footer from '@/components/layout/Footer.jsx'
import Navbar from '@/components/layout/Navbar.jsx'

function CustomerLayout() {
  return <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900"><Navbar /><MainContainer><Outlet /></MainContainer><Footer /></div>
}

export default CustomerLayout
