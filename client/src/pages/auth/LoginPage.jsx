import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '@/components/ui/Alert.jsx'
import Button from '@/components/ui/Button.jsx'
import Card from '@/components/ui/Card.jsx'
import Input from '@/components/ui/Input.jsx'
import Logo from '@/components/ui/Logo.jsx'
import { getDashboardRoute, ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

const getSafeErrorMessage = (error) => {
  const status = error.response?.status

  if (status === 401) return 'Email or password is incorrect.'
  if (status === 429) return 'Too many attempts. Please wait before trying again.'
  if (status && status >= 500) return 'We could not sign you in right now. Please try again shortly.'
  if (!error.response) return 'Unable to reach Sellora. Check your connection and try again.'
  return 'Please review the form and try again.'
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ mode: 'onBlur' })

  const onSubmit = async (values) => {
    setFormError('')

    try {
      const currentUser = await login(values)
      toast.success('Welcome back to Sellora.')
      navigate(getDashboardRoute(currentUser?.role), { replace: true })
    } catch (error) {
      const validationErrors = error.response?.data?.errors ?? []

      validationErrors.forEach(({ field, message }) => {
        if (field === 'email' || field === 'password') {
          setError(field, { type: 'server', message })
        }
      })

      const message = getSafeErrorMessage(error)
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <div className="w-full max-w-md">
      <Card className="w-full p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Logo className="justify-center text-[2.5rem] sm:text-[2.75rem]" />
          <h1 className="mt-7 font-serif text-[1.625rem] font-semibold tracking-[-0.055em] text-slate-950 sm:text-[1.75rem]">Welcome back</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">Sign in to continue shopping.</p>
        </div>

        <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {formError && <Alert>{formError}</Alert>}
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
            })}
          />
          <Input
            autoComplete="current-password"
            disabled={isSubmitting}
            error={errors.password}
            id="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Password must be at least 8 characters.' },
            })}
          />
          <div className="flex justify-end">
            <Link className="rounded-md text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" to={ROUTES.forgotPassword}>Forgot password?</Link>
          </div>
          <Button className="w-full" isLoading={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link className="rounded-md font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" to={ROUTES.register}>Create account</Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
