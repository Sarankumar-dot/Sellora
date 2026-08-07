import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '@/components/ui/Alert.jsx'
import Button from '@/components/ui/Button.jsx'
import Card from '@/components/ui/Card.jsx'
import Input from '@/components/ui/Input.jsx'
import Logo from '@/components/ui/Logo.jsx'
import { ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

const trimValue = (value) => (typeof value === 'string' ? value.trim() : value)

const getSafeErrorMessage = (error) => {
  const backendMessage = error.response?.data?.message

  if (backendMessage) return backendMessage
  if (!error.response || error.code === 'ECONNABORTED') {
    return 'Unable to reach Sellora. Check your connection and try again.'
  }

  return 'The request could not be completed. Please try again.'
}

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword } = useAuth()
  const [formError, setFormError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [requestedEmail, setRequestedEmail] = useState('')
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur', shouldFocusError: true })

  useEffect(() => {
    if (!isSuccess || !requestedEmail) {
      return undefined
    }

    const redirectTimer = window.setTimeout(() => {
      navigate(ROUTES.resetPassword, { replace: true, state: { email: requestedEmail } })
    }, 1500)

    return () => window.clearTimeout(redirectTimer)
  }, [isSuccess, navigate, requestedEmail])

  const onSubmit = async ({ email }) => {
    setFormError('')

    try {
      await forgotPassword(email)
      setRequestedEmail(email)
      setIsSuccess(true)
      toast.success('Verification code sent. Check your email.')
    } catch (error) {
      const validationErrors = error.response?.data?.errors ?? []

      validationErrors.forEach(({ field, message }, index) => {
        if (field === 'email') {
          setError('email', { type: 'server', message }, { shouldFocus: index === 0 })
        }
      })

      const message = getSafeErrorMessage(error)
      setFormError(message)
      toast.error(message)
    }
  }

  const isDisabled = isSubmitting || isSuccess

  return (
    <div className="w-full max-w-md">
      <Card className="w-full rounded-4xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Logo className="justify-center text-[2.5rem] sm:text-[2.75rem]" />
          <h1 className="mt-7 text-[1.625rem] font-semibold tracking-[-0.055em] text-slate-950 sm:text-[1.75rem]">Forgot Password</h1>
          <p className="mt-2 text-center text-sm leading-6 text-slate-500">Enter your email and we&apos;ll send you a verification code to reset your password.</p>
        </div>

        <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          {formError && <Alert>{formError}</Alert>}
          {isSuccess && <Alert variant="success">We sent a verification code to your email. Check your inbox.</Alert>}
          <Input
            autoComplete="email"
            disabled={isDisabled}
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
          <Button className="w-full" disabled={isSuccess} isLoading={isSubmitting} type="submit">
            {isSubmitting ? 'Sending Verification Code...' : 'Send Verification Code'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link className="rounded-md font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" to={ROUTES.login}>Sign in</Link>
        </p>
      </Card>
    </div>
  )
}

export default ForgotPasswordPage
