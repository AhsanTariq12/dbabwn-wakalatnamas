'use client'

import { useFormStatus } from 'react-dom'

export default function LoginSubmitButton(props: { action: (formData: FormData) => void }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      formAction={props.action}
      disabled={pending}
      aria-disabled={pending}
      className={`w-full h-12 font-medium rounded-xl text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black ${
        pending
          ? 'bg-blue-600/30 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]'
      }`}
    >
      <span className="inline-flex items-center justify-center gap-3">
        {pending && (
          <span
            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
            aria-hidden="true"
          />
        )}
        {pending ? 'Signing in…' : 'Sign In'}
      </span>
    </button>
  )
}

