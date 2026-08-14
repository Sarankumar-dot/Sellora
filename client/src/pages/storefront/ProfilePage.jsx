import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { formatDistanceToNow } from 'date-fns';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile Form (Placeholder for now)
  const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
    }
  });

  // Password Form
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Fetch Sessions
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/sessions');
      const payload = response.data?.data || response.data;
      return Array.isArray(payload) ? payload : [];
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      resetPasswordForm();
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error) => {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  });

  // Logout All Mutation
  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      // Keep current session active, or if backend revokes all including current, handle it
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="bg-surface dark:bg-surface-container w-full top-0 flat no shadows relative z-50 border-b border-surface-variant/50">
        <div className="max-w-container-max mx-auto px-margin-desktop flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display-lg text-display-lg tracking-tight text-primary dark:text-on-surface">Sellora</Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link to="/products" className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-on-surface transition-colors hover:opacity-80">Shop</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-16 flex flex-col md:flex-row gap-gutter-desktop">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <h2 className="font-headline-md text-headline-md mb-8">Account</h2>
          <nav className="flex flex-col gap-2">
            <Link to="/profile" className="font-label-md text-label-md text-primary bg-surface-container-low px-4 py-3 rounded-lg flex items-center justify-between">
              <span>Profile</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
            <Link to="/orders" className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors px-4 py-3 rounded-lg flex items-center justify-between">
              <span>Orders</span>
            </Link>
            <button onClick={handleLogout} className="font-label-md text-label-md text-error hover:bg-error-container hover:text-on-error-container transition-colors px-4 py-3 rounded-lg flex items-center justify-start mt-8 text-left w-full">
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 mb-4 border-b border-surface-variant no-scrollbar">
           <Link to="/profile" className="font-label-md text-label-md text-primary bg-surface-container-low px-4 py-2 rounded-full whitespace-nowrap">Profile</Link>
           <Link to="/orders" className="font-label-md text-label-md text-on-surface-variant hover:text-primary px-4 py-2 rounded-full whitespace-nowrap">Orders</Link>
           <button onClick={handleLogout} className="font-label-md text-label-md text-error px-4 py-2 whitespace-nowrap">Sign Out</button>
        </div>

        {/* Main Content Area */}
        <section className="flex-1 max-w-3xl">
          <h1 className="font-headline-lg text-headline-lg mb-12">Personal Information</h1>
          
          <div className="space-y-12">

            {/* Become a Seller Banner (for Buyers) */}
            {user?.role === 'buyer' && (
              <div className="bg-surface-container-high/40 p-6 rounded-xl border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary">Start Selling on Sellora</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">Open your store, list curated goods, and reach buyers worldwide.</p>
                </div>
                <Link
                  to="/seller/onboarding"
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
                >
                  Become a Seller
                </Link>
              </div>
            )}
            
            {/* Basic Info Section */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container-highest shadow-[0_4px_20px_rgba(26,26,26,0.02)]">
              <h3 className="font-headline-md text-headline-md mb-6">Profile Details</h3>
              <form onSubmit={handleSubmitProfile(() => alert('Profile update placeholder'))} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="name">Full Name</label>
                  <input 
                    {...registerProfile('name')}
                    id="name" 
                    type="text" 
                    className="w-full px-4 py-3 font-body-md text-body-md text-primary bg-surface border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
                  <input 
                    {...registerProfile('email')}
                    id="email" 
                    type="email" 
                    disabled
                    className="w-full px-4 py-3 font-body-md text-body-md text-on-surface-variant bg-surface-container-low border border-outline-variant rounded cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="mobileNumber">Mobile Number</label>
                  <input 
                    {...registerProfile('mobileNumber')}
                    id="mobileNumber" 
                    type="tel" 
                    className="w-full px-4 py-3 font-body-md text-body-md text-primary bg-surface border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">Save Changes</button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container-highest shadow-[0_4px_20px_rgba(26,26,26,0.02)]">
              <h3 className="font-headline-md text-headline-md mb-6">Security</h3>
              
              {passwordSuccess && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined">check_circle</span>
                  <p className="font-body-md text-sm">Password updated successfully.</p>
                </div>
              )}
              
              {passwordError && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
                  <span className="material-symbols-outlined">error</span>
                  <p className="font-body-md text-sm">{passwordError}</p>
                </div>
              )}

              <form onSubmit={handleSubmitPassword((data) => changePasswordMutation.mutate(data))} className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="currentPassword">Current Password</label>
                  <input 
                    {...registerPassword('oldPassword')}
                    id="currentPassword" 
                    type="password" 
                    className={`w-full px-4 py-3 font-body-md text-body-md text-primary bg-surface border ${passwordErrors.oldPassword ? 'border-error' : 'border-outline-variant'} rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                  />
                  {passwordErrors.oldPassword && <p className="text-sm text-error mt-1">{passwordErrors.oldPassword.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="newPassword">New Password</label>
                  <input 
                    {...registerPassword('newPassword')}
                    id="newPassword" 
                    type="password" 
                    className={`w-full px-4 py-3 font-body-md text-body-md text-primary bg-surface border ${passwordErrors.newPassword ? 'border-error' : 'border-outline-variant'} rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                  />
                  {passwordErrors.newPassword && <p className="text-sm text-error mt-1">{passwordErrors.newPassword.message}</p>}
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={changePasswordMutation.isPending}
                    className="bg-transparent border border-primary text-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Sessions Section */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-container-highest shadow-[0_4px_20px_rgba(26,26,26,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md">Active Sessions</h3>
                <button 
                  onClick={() => logoutAllMutation.mutate()}
                  disabled={logoutAllMutation.isPending || sessions.length <= 1}
                  className="font-label-sm text-label-sm text-secondary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {logoutAllMutation.isPending ? 'Revoking...' : 'Revoke All'}
                </button>
              </div>
              
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Manage devices currently logged into your account.</p>
              
              {isLoadingSessions ? (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <p className="font-body-md text-sm">Loading sessions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-surface-container-high">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined">{session.deviceInfo?.includes('Mobile') ? 'smartphone' : 'computer'}</span>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-primary">{session.deviceInfo || 'Unknown Device'}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                            {session.ipAddress} • Last active {formatDistanceToNow(new Date(session.lastUsedAt))} ago
                          </p>
                        </div>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary-container bg-secondary-fixed-dim/20 px-2 py-1 rounded">Active</span>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="font-body-md text-on-surface-variant">No active sessions found.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
