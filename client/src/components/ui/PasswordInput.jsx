import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Input from '@/components/ui/Input.jsx'

function PasswordInput({ disabled, ...props }) {
  const [isVisible, setIsVisible] = useState(false)
  const label = isVisible ? 'Hide password' : 'Show password'

  return (
    <Input
      {...props}
      disabled={disabled}
      endAdornment={(
        <button
          aria-label={label}
          className="rounded-md p-1 text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={() => setIsVisible((visible) => !visible)}
          type="button"
        >
          {isVisible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </button>
      )}
      type={isVisible ? 'text' : 'password'}
    />
  )
}

export default PasswordInput
