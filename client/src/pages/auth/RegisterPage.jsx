import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '@/components/ui/Alert.jsx'
import Button from '@/components/ui/Button.jsx'
import Card from '@/components/ui/Card.jsx'
import Input from '@/components/ui/Input.jsx'
import Logo from '@/components/ui/Logo.jsx'
import PasswordInput from '@/components/ui/PasswordInput.jsx'
import { ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

const trimValue = (value) => (typeof value === 'string' ? value.trim() : value)

const getSafeErrorMessage = (error) => {
  const status = error.response?.status

  if (status === 409) return 'An account with this email already exists.'
  if (status === 429) return 'Too many attempts. Please wait before trying again.'
  if (status && status >= 500) return 'We could not create your account right now. Please try again shortly.'
  if (!error.response) return 'Unable to reach Sellora. Check your connection and try again.'
  return 'Please review the form and try again.'
}

const fieldNames = {
  name: 'name',
  email: 'email',
  mobileNumber: 'mobileNumber',
  mobile_number: 'mobileNumber',
  password: 'password',
}

function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerAccount } = useAuth()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur', shouldFocusError: true })

  const onSubmit = async (values) => {
    setFormError('')

    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        mobileNumber: values.mobileNumber,
        password: values.password,
      })
      toast.success('Your Sellora account has been created.')
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      const validationErrors = error.response?.data?.errors ?? []

      validationErrors.forEach(({ field, message }, index) => {
        const fieldName = fieldNames[field]

        if (fieldName) {
          setError(fieldName, { type: 'server', message }, { shouldFocus: index === 0 })
        }
      })

      const message = getSafeErrorMessage(error)
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="w-full rounded-4xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Logo className="justify-center text-[2.5rem] sm:text-[2.75rem]" />
          <h1 className="mt-7 text-[1.625rem] font-semibold tracking-[-0.055em] text-slate-950 sm:text-[1.75rem]">Create your account</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">Join Sellora and start shopping.</p>
        </div>

        <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {formError && <Alert>{formError}</Alert>}
          <Input
            autoComplete="name"
            disabled={isSubmitting}
            error={errors.name}
            id="name"
            label="Full Name"
            placeholder="Your full name"
            {...register('name', {
              required: 'Full name is required.',
              minLength: { value: 3, message: 'Full name must be at least 3 characters.' },
              maxLength: { value: 100, message: 'Full name must be at most 100 characters.' },
              setValueAs: trimValue,
            })}
          />
          <Input
            autoComplete="email"
            disabled={isSubmitting}
            error={errors.email}
            id="email"
            label="Email"
            placeholder="you@example.com"
            type="email"
            {...register('email', {
              required: 'Email is required.',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
              setValueAs: trimValue,
            })}
          />
          <Input
            autoComplete="tel"
            disabled={isSubmitting}
            error={errors.mobileNumber}
            id="mobileNumber"
            inputMode="numeric"
            label="Mobile Number"
            maxLength={10}
            placeholder="9876543210"
            type="tel"
            {...register('mobileNumber', {
              required: 'Mobile number is required.',
              pattern: { value: /^\d{10}$/, message: 'Enter a 10-digit mobile number.' },
              setValueAs: trimValue,
            })}
          />
          <PasswordInput
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.password}
            id="password"
            label="Password"
            placeholder="Create a password"
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Password must be at least 8 characters.' },
              setValueAs: trimValue,
            })}
          />
          <PasswordInput
            autoComplete="new-password"
            disabled={isSubmitting}
            error={errors.confirmPassword}
            id="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password.',
              setValueAs: trimValue,
              validate: (value, formValues) => value === formValues.password || 'Passwords do not match.',
            })}
          />
          <Button className="w-full" isLoading={isSubmitting} type="submit">
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="rounded-md font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" to={ROUTES.login}>Sign in</Link>
        </p>
      </Card>
    </div>
  )
}

export default RegisterPage
