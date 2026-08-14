import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must contain only numbers'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: location.state?.email || ''
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        email: data.email,
        otp: data.otp,
        newPassword: data.password
      };
      const response = await apiClient.post('/auth/reset-password', payload);
      return response.data;
    },
    onSuccess: () => {
      navigate('/auth/login', { state: { message: 'Password reset successful. Please log in with your new password.' } });
    },
    onError: (error) => {
      setResetError(error.response?.data?.message || 'Failed to reset password. Please check your OTP and try again.');
    }
  });

  const onSubmit = (data) => {
    setResetError(null);
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col md:flex-row">
      {/* Left Side: Brand Image (Hidden on mobile) */}
      <div className="hidden md:flex w-1/2 bg-surface-container-high h-screen sticky top-0 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="bg-cover bg-center w-full h-full object-cover grayscale opacity-90 mix-blend-multiply" style={{ backgroundImage: `url('/images/hero.png')` }}></div>
        </div>
        <div className="relative z-10 p-12 flex flex-col justify-between w-full h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          <div>
            <span className="font-headline-md text-headline-md text-on-primary">Sellora</span>
          </div>
          <div className="mb-12">
            <h2 className="font-display-lg text-display-lg text-on-primary mb-4 leading-tight">Secure <br/>Account.</h2>
            <p className="font-body-lg text-body-lg text-on-primary/90 max-w-md">Create a new, strong password to regain access to your account.</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-background min-h-screen">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-12">
            <span className="font-headline-md text-headline-md text-primary font-bold">Sellora</span>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-headline-lg text-headline-lg text-primary">Create New Password</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Secure your account</p>
          </div>

          {resetError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm">
              {resetError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <p className="font-body-md text-body-md text-on-surface-variant text-center">
              Enter your email, the 6-digit OTP we sent you, and your new password.
            </p>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-label-md text-label-md text-on-surface mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">mail</span>
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-error' : 'border-outline-variant'} rounded-lg bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md transition-colors`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error font-body-md">{errors.email.message}</p>
              )}
            </div>

            {/* OTP */}
            <div>
              <label htmlFor="otp" className="block font-label-md text-label-md text-on-surface mb-2">One-Time Password (OTP)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">pin</span>
                </div>
                <input
                  {...register('otp')}
                  id="otp"
                  type="text"
                  maxLength={6}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.otp ? 'border-error' : 'border-outline-variant'} rounded-lg bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md transition-colors tracking-widest`}
                  placeholder="000000"
                />
              </div>
              {errors.otp && (
                <p className="mt-1 text-sm text-error font-body-md">{errors.otp.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block font-label-md text-label-md text-on-surface mb-2">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-error' : 'border-outline-variant'} rounded-lg bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md transition-colors`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-outline hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error font-body-md">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block font-label-md text-label-md text-on-surface mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock_reset</span>
                </div>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-error' : 'border-outline-variant'} rounded-lg bg-surface text-on-surface focus:ring-1 focus:ring-primary focus:border-primary font-body-md text-body-md transition-colors`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-outline hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error font-body-md">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-secondary bg-secondary hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-70 mt-4"
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link to="/auth/login" className="font-label-md text-label-md text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
