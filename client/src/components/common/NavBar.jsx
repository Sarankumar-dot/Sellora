import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, Store, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NavBar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-heading font-semibold tracking-tight text-primary">
            Sellora
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-sm font-medium hover:text-secondary transition-colors">Shop</Link>
            {user?.role === 'seller' && (
              <Link to="/seller/dashboard" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                <Store className="size-4" />
                <span>Seller Hub</span>
              </Link>
            )}
            {isAuthenticated && user?.role === 'buyer' && (
              <Link to="/seller/onboarding" className="text-sm font-medium text-secondary hover:underline flex items-center gap-1">
                <Store className="size-4" />
                <span>Become a Seller</span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-sm font-medium text-error hover:underline flex items-center gap-1">
                <Shield className="size-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/products" aria-label="Search" className="p-2 text-foreground hover:text-secondary transition-colors">
            <Search className="size-5" />
          </Link>
          
          <Link 
            to={isAuthenticated ? "/profile" : "/auth/login"} 
            aria-label="Account" 
            className="hidden md:flex items-center gap-2 p-2 text-foreground hover:text-secondary transition-colors"
          >
            {isAuthenticated ? (
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            ) : (
              <User className="size-5" />
            )}
          </Link>

          <Link to="/cart" aria-label="Cart" className="p-2 text-foreground hover:text-secondary transition-colors">
            <ShoppingBag className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
