import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Categories', path: '/admin/categories', icon: 'category' },
    { label: 'Platform Orders', path: '/admin/orders', icon: 'orders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* Header */}
      <header className="w-full bg-surface dark:bg-surface-container border-b border-surface-variant sticky top-0 z-40">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface hover:text-primary p-2 -ml-2"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="font-display-lg text-headline-lg text-primary">Sellora</span>
              <span className="bg-error-container text-on-error-container font-label-sm text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="hidden sm:flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Main Storefront</span>
            </Link>

            <div className="h-6 w-px bg-surface-variant hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-label-md text-sm text-on-surface font-medium leading-none">{user?.name || 'Administrator'}</p>
                <p className="font-body-md text-xs text-on-surface-variant leading-none mt-1">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-container-max w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-surface-variant p-6 flex-shrink-0 min-h-[calc(100vh-5rem)] bg-surface-bright">
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-surface-variant space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md text-error hover:bg-error-container hover:text-on-error-container transition-colors text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex">
            <div className="w-4/5 max-w-xs bg-surface h-full p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-center mb-8 border-b border-surface-variant pb-4">
                  <span className="font-display-lg text-headline-md text-primary">Admin Portal</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-on-surface-variant p-1">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md ${
                          isActive
                            ? 'bg-primary text-on-primary font-semibold'
                            : 'text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-surface-variant pt-4 space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[20px]">storefront</span>
                  <span>Main Storefront</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md text-error hover:bg-error-container text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 min-w-0 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
