import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { useToast } from '../hooks/toastContext'
import { consumeSessionExpired } from '../utils/authStorage'
import { useI18n } from '../utils/i18n'
import { normalizeApiError } from '../utils/normalizeApiError'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (consumeSessionExpired()) {
      pushToast({
        type: 'error',
        message: t('auth.session_expired')
      })
    }
  }, [pushToast, t])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login({
        email: form.email.trim(),
        password: form.password
      }, {
        errorFallbackMessage: t('auth.login_failed')
      })
      const from = location.state?.from
      const path = from?.pathname || '/home'
      const search = from?.search || ''
      const hash = from?.hash || ''
      const redirectPath = `${path}${search}${hash}`
      const safeRedirectPath = redirectPath === '/login' ? '/home' : redirectPath

      navigate(safeRedirectPath, { replace: true })
    } catch (err) {
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-800">{t('auth.login')}</h2>
      <p className="mt-1 text-sm text-slate-500">{t('auth.login_description')}</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('auth.email')}</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('auth.email_placeholder')}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('auth.password')}</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('auth.password_placeholder')}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-slate-800 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t('auth.logging_in') : t('auth.login')}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {t('auth.no_account')}{' '}
        <Link to="/register" className="font-medium text-slate-800 underline">
          {t('auth.register')}
        </Link>
      </p>
    </section>
  )
}
