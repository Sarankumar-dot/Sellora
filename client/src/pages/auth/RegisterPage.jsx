import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      // Backend POST /auth/register expects: { name, email, password, mobileNumber }
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: () => {
      // Upon successful registration, redirect to login
      navigate('/auth/login', { state: { message: 'Registration successful. Please log in.' } });
    },
    onError: (error) => {
      setRegisterError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  });

  const onSubmit = (data) => {
    setRegisterError(null);
    const payload = {
      name: data.name,
      email: data.email,
      mobileNumber: data.mobileNumber,
      password: data.password
    };
    registerMutation.mutate(payload);
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
            <h2 className="font-display-lg text-display-lg text-on-primary mb-4 leading-tight">Curated <br/>Excellence.</h2>
            <p className="font-body-lg text-body-lg text-on-primary/90 max-w-md">Join a marketplace dedicated to exceptional design and uncompromising quality.</p>
          </div>
        </div>
      </div>

      {/* Right Side: Register Card */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-background min-h-screen">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-12">
            <span className="font-headline-md text-headline-md text-primary font-bold">Sellora</span>
          </div>
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-headline-lg text-headline-lg text-primary">Create Account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Join Sellora to discover or offer premium goods.</p>
          </div>

          {registerError && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm">
              {registerError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-label-md text-label-md text-on-surface mb-1">Full Name</label>
                <input 
                  {...register('name')}
                  id="name" 
                  type="text" 
                  placeholder="Jane Doe"
                  className={`w-full bg-surface border ${errors.name ? 'border-error' : 'border-outline-variant'} rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                />
                {errors.name && <p className="mt-1 text-sm text-error font-body-md">{errors.name.message}</p>}
              </div>

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
                <label htmlFor="mobileNumber" className="block font-label-md text-label-md text-on-surface mb-1">Mobile Number</label>
                <input 
                  {...register('mobileNumber')}
                  id="mobileNumber" 
                  type="tel" 
                  placeholder="9876543210"
                  className={`w-full bg-surface border ${errors.mobileNumber ? 'border-error' : 'border-outline-variant'} rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                />
                {errors.mobileNumber && <p className="mt-1 text-sm text-error font-body-md">{errors.mobileNumber.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block font-label-md text-label-md text-on-surface mb-1">Password</label>
                <div className="relative">
                  <input 
                    {...register('password')}
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete="new-password"
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

            {/* Action Button */}
            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg hover:bg-inverse-surface transition-colors disabled:opacity-70"
            >
              {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary font-label-md text-label-md hover:underline underline-offset-4 decoration-primary">
                Log in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
