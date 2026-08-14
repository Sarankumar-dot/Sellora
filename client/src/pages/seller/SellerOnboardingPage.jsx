import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const onboardingSchema = z.object({
  storeName: z.string().min(3, 'Store name must be at least 3 characters'),
  gstNumber: z.string()
    .toUpperCase()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d][Z][A-Z\d]$/, 'Must be a valid 15-digit GSTIN (e.g. 22AAAAA0000A1Z5)'),
  panNumber: z.string()
    .toUpperCase()
    .regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Must be a valid 10-digit PAN (e.g. ABCDE1234F)'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(255, 'Address maximum 255 characters'),
  description: z.string().optional(),
  logo: z.string().url('Logo must be a valid URL').or(z.literal('')).optional(),
});

const PRESET_LOGOS = [
  { name: 'Minimal Craft', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80' },
  { name: 'Luxe Goods', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=200&q=80' },
  { name: 'Artisan Studio', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80' },
];

export default function SellerOnboardingPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [submitError, setSubmitError] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      storeName: '',
      gstNumber: '',
      panNumber: '',
      address: '',
      description: '',
      logo: '',
    }
  });

  const logoValue = watch('logo');

  const onboardingMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/seller/profile', data);
      return response.data;
    },
    onSuccess: async () => {
      // Refresh AuthContext so user.role is updated to seller immediately
      await checkAuth();
      navigate('/seller/dashboard');
    },
    onError: (error) => {
      setSubmitError(error.response?.data?.message || 'Failed to complete seller onboarding. Please verify your details.');
    }
  });

  const onSubmit = (data) => {
    setSubmitError(null);
    // Clean up empty optional fields
    const payload = {
      ...data,
      gstNumber: data.gstNumber.toUpperCase(),
      panNumber: data.panNumber.toUpperCase(),
      description: data.description || undefined,
      logo: data.logo || undefined,
    };
    onboardingMutation.mutate(payload);
  };

  return (
    <div className="bg-background text-on-background min-h-screen py-12 px-margin-mobile md:px-margin-desktop flex items-center justify-center">
      <div className="max-w-2xl w-full bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-ambient border border-outline-variant/20">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="font-display-lg text-headline-md text-primary font-bold tracking-tight">Sellora</span>
          <h1 className="font-headline-lg text-headline-lg text-primary mt-4 mb-2">Become a Seller</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Set up your storefront profile to start offering your curated products.</p>
        </div>

        {submitError && (
          <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
            <span className="material-symbols-outlined">error</span>
            <p className="font-body-md text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Store Name */}
          <div>
            <label htmlFor="storeName" className="block font-label-md text-label-md text-on-surface mb-2">Store Name *</label>
            <input 
              {...register('storeName')}
              id="storeName"
              type="text"
              placeholder="e.g. Atelier Studio"
              className={`w-full px-4 py-3 bg-surface border ${errors.storeName ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.storeName && <p className="text-sm text-error mt-1">{errors.storeName.message}</p>}
          </div>

          {/* Tax Identification (GST & PAN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gstNumber" className="block font-label-md text-label-md text-on-surface mb-2">GSTIN Number *</label>
              <input 
                {...register('gstNumber')}
                id="gstNumber"
                type="text"
                placeholder="22AAAAA0000A1Z5"
                className={`w-full px-4 py-3 bg-surface border ${errors.gstNumber ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md uppercase focus:outline-none focus:border-primary transition-colors`}
              />
              {errors.gstNumber && <p className="text-sm text-error mt-1">{errors.gstNumber.message}</p>}
            </div>

            <div>
              <label htmlFor="panNumber" className="block font-label-md text-label-md text-on-surface mb-2">PAN Number *</label>
              <input 
                {...register('panNumber')}
                id="panNumber"
                type="text"
                placeholder="ABCDE1234F"
                className={`w-full px-4 py-3 bg-surface border ${errors.panNumber ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md uppercase focus:outline-none focus:border-primary transition-colors`}
              />
              {errors.panNumber && <p className="text-sm text-error mt-1">{errors.panNumber.message}</p>}
            </div>
          </div>

          {/* Business Address */}
          <div>
            <label htmlFor="address" className="block font-label-md text-label-md text-on-surface mb-2">Business Address *</label>
            <textarea 
              {...register('address')}
              id="address"
              rows={3}
              placeholder="Full registered business address..."
              className={`w-full px-4 py-3 bg-surface border ${errors.address ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.address && <p className="text-sm text-error mt-1">{errors.address.message}</p>}
          </div>

          {/* Store Description */}
          <div>
            <label htmlFor="description" className="block font-label-md text-label-md text-on-surface mb-2">Store Description (Optional)</label>
            <textarea 
              {...register('description')}
              id="description"
              rows={3}
              placeholder="Tell buyers about your craftsmanship, values, and offerings..."
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Store Logo URL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="logo" className="font-label-md text-label-md text-on-surface">Store Logo URL (Optional)</label>
              <span className="text-[11px] font-label-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">
                Paste hosted image URL — Upload endpoint coming soon
              </span>
            </div>
            <input 
              {...register('logo')}
              id="logo"
              type="url"
              placeholder="https://example.com/logo.jpg"
              className={`w-full px-4 py-3 bg-surface border ${errors.logo ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.logo && <p className="text-sm text-error mt-1">{errors.logo.message}</p>}

            {/* Logo Presets Quick Select */}
            <div className="mt-3">
              <p className="font-label-sm text-xs text-on-surface-variant mb-2">Quick Select Sample Logo:</p>
              <div className="flex gap-3">
                {PRESET_LOGOS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setValue('logo', preset.url)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-md hover:border-primary text-xs font-label-md text-on-surface transition-colors"
                  >
                    <img src={preset.url} alt={preset.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {logoValue && !errors.logo && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <img src={logoValue} alt="Logo preview" className="w-12 h-12 rounded-full object-cover border border-outline" />
                <span className="text-xs text-on-surface-variant font-label-sm">Logo Preview Active</span>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={onboardingMutation.isPending}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70 shadow-sm"
            >
              {onboardingMutation.isPending ? 'Submitting Application...' : 'Complete Onboarding & Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
