import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Shop', path: '/products' },
    { icon: ShoppingBag, label: 'Cart', path: '/cart' },
    { icon: User, label: 'Account', path: isAuthenticated ? '/profile' : '/auth/login' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground hover:text-primary transition-colors",
                isActive && "text-primary font-semibold"
              )}
            >
              <item.icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
