import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { useToast } from '../hooks/toastContext'
import { useI18n } from '../utils/i18n'
import { normalizeApiError } from '../utils/normalizeApiError'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    language: 'en'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        language: form.language
      }, {
        errorFallbackMessage: t('auth.register_failed')
      })
      pushToast({
        type: 'success',
        message: t('auth.register_success')
      })
      navigate('/login', { replace: true })
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
      <h2 className="text-2xl font-semibold text-slate-800">{t('auth.register')}</h2>
      <p className="mt-1 text-sm text-slate-500">{t('auth.register_description')}</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('auth.name')}</span>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t('auth.name_placeholder')}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            required
          />
        </label>

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

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">{t('auth.language')}</span>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
          >
            <option value="en">{t('language.en')}</option>
            <option value="vi">{t('language.vi')}</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-slate-800 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t('auth.registering') : t('auth.register')}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        {t('auth.has_account')}{' '}
        <Link to="/login" className="font-medium text-slate-800 underline">
          {t('auth.login')}
        </Link>
      </p>
    </section>
  )
}
