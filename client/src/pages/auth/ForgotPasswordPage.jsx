import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'OTP sent successfully.');
    },
    onError: (error) => {
      setErrorMessage(error.response?.data?.message || 'Failed to send OTP.');
    }
  });

  const onSubmit = (data) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    forgotPasswordMutation.mutate(data);
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
            <h2 className="font-display-lg text-display-lg text-on-primary mb-4 leading-tight">Reset <br/>Access.</h2>
            <p className="font-body-lg text-body-lg text-on-primary/90 max-w-md">Recover your account to continue your journey with us.</p>
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
            <h1 className="font-headline-lg text-headline-lg text-primary">Reset Password</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter your email to reset</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage || forgotPasswordMutation.isSuccess ? (
            <div className="text-center space-y-6 mt-8">
              <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg">
                <p className="font-body-md text-body-md text-on-surface">
                  {successMessage || "If an account exists for that email, we've sent a 6-digit OTP to reset your password."}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/auth/reset-password" state={{ email: forgotPasswordMutation.variables?.email }}>
                  <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-secondary bg-secondary hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors">
                    Enter OTP to Reset Password
                  </button>
                </Link>
                <Link to="/auth/login">
                  <button className="w-full flex justify-center py-3 px-4 border border-outline rounded-lg font-label-md text-label-md text-primary bg-transparent hover:bg-surface-container-low transition-colors">
                    Back to log in
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
              <p className="font-body-md text-body-md text-on-surface-variant text-center">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block font-label-md text-label-md text-on-surface mb-2">Email address</label>
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

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-secondary bg-secondary hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-70"
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send OTP'}
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
          )}

        </div>
      </div>
    </div>
  );
}
