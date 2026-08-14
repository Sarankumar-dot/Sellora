import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || "/";
  const successMessage = location.state?.message;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const payload = data.data || data;
      const token = payload.token || payload.accessToken;
      const user = payload.user || payload;
      login(token, user);
      navigate(from, { replace: true });
    },
    onError: (error) => {
      setLoginError(error.response?.data?.message || 'Failed to login. Please check your credentials.');
    }
  });

  const onSubmit = (data) => {
    setLoginError(null);
    loginMutation.mutate(data);
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
            <h2 className="font-display-lg text-display-lg text-on-primary mb-4 leading-tight">Welcome <br/>Back.</h2>
            <p className="font-body-lg text-body-lg text-on-primary/90 max-w-md">Sign in to continue exploring exceptional design and uncompromising quality.</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-background min-h-screen">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-12">
            <span className="font-headline-md text-headline-md text-primary font-bold">Sellora</span>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-headline-lg text-headline-lg text-primary">Sign in</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your account to continue.</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg font-body-md text-sm">
              {successMessage}
            </div>
          )}

          {loginError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm">
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-label-md text-label-md text-on-surface mb-1">Email Address</label>
                <input 
                  {...register('email')}
                  id="email" 
                  type="email" 
                  autoComplete="email"
                  placeholder="jane@example.com"
                  className={`w-full bg-surface border ${errors.email ? 'border-error' : 'border-outline-variant'} rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                />
                {errors.email && <p className="mt-1 text-sm text-error font-body-md">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block font-label-md text-label-md text-on-surface mb-1">Password</label>
                <div className="relative">
                  <input 
                    {...register('password')}
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full bg-surface border ${errors.password ? 'border-error' : 'border-outline-variant'} rounded-lg px-4 py-3 pr-10 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-error font-body-md">{errors.password.message}</p>}
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface"
                />
                <label htmlFor="remember-me" className="ml-2 block font-body-md text-sm text-on-surface-variant cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/auth/forgot-password" className="font-label-md text-sm text-primary hover:underline underline-offset-4 decoration-primary">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Action Button */}
            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg hover:bg-inverse-surface transition-colors disabled:opacity-70"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-primary font-label-md text-label-md hover:underline underline-offset-4 decoration-primary">
                Create one now
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
