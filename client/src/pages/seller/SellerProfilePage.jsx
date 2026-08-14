import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const sellerProfileSchema = z.object({
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

export default function SellerProfilePage() {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch Seller Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/seller/profile');
      return response.data;
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(sellerProfileSchema),
  });

  const logoValue = watch('logo');

  useEffect(() => {
    if (profile) {
      reset({
        storeName: profile.storeName || profile.store_name || '',
        gstNumber: profile.gstNumber || profile.gst_number || '',
        panNumber: profile.panNumber || profile.pan_number || '',
        address: profile.address || '',
        description: profile.description || '',
        logo: profile.logo || '',
      });
    }
  }, [profile, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put('/seller/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      setSubmitSuccess(true);
      setSubmitError(null);
      setTimeout(() => setSubmitSuccess(false), 4000);
    },
    onError: (error) => {
      setSubmitError(error.response?.data?.message || 'Failed to update store profile.');
    }
  });

  const onSubmit = (data) => {
    setSubmitError(null);
    setSubmitSuccess(false);
    const payload = {
      ...data,
      gstNumber: data.gstNumber.toUpperCase(),
      panNumber: data.panNumber.toUpperCase(),
      description: data.description || undefined,
      logo: data.logo || undefined,
    };
    updateProfileMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading seller profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display-lg text-headline-lg text-primary">Store Profile</h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Manage your business information, tax identification, and store branding.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <p className="font-body-md text-sm">Store profile updated successfully!</p>
        </div>
      )}

      {submitError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md text-sm">{submitError}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-surface-variant shadow-ambient">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Store Name */}
          <div>
            <label htmlFor="storeName" className="block font-label-md text-label-md text-on-surface mb-2">Store Name *</label>
            <input 
              {...register('storeName')}
              id="storeName"
              type="text"
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
                className={`w-full px-4 py-3 bg-surface border ${errors.panNumber ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md uppercase focus:outline-none focus:border-primary transition-colors`}
              />
              {errors.panNumber && <p className="text-sm text-error mt-1">{errors.panNumber.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block font-label-md text-label-md text-on-surface mb-2">Business Address *</label>
            <textarea 
              {...register('address')}
              id="address"
              rows={3}
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
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Store Logo */}
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
              className={`w-full px-4 py-3 bg-surface border ${errors.logo ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.logo && <p className="text-sm text-error mt-1">{errors.logo.message}</p>}

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
                <span className="text-xs text-on-surface-variant font-label-sm">Active Logo Preview</span>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70 shadow-sm"
            >
              {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
