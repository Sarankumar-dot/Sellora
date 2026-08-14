import { Outlet } from 'react-router-dom';
import NavBar from '@/components/common/NavBar';
import BottomNav from '@/components/common/BottomNav';

export default function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
