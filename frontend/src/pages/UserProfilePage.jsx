import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'
import { useAuth } from '../hooks/authContext'
import { getMyProfile, updateMyProfile } from '../services/userSelfService'

const EMPTY_FORM = {}

export default function UserProfilePage() {
  const { t } = useI18n()
  const { pushToast } = useToast()
  const { syncUser } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)
  const [password, setPassword] = useState('')

  const profileQuery = useQuery({
    queryKey: ['my-profile'],
    queryFn: () =>
      getMyProfile({
        errorFallbackMessage: t('user.profile.load_failed')
      })
  })

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      updateMyProfile(payload, {
        errorFallbackMessage: t('user.profile.update_failed')
      }),
    onSuccess: (updatedUser) => {
      syncUser(updatedUser)
      queryClient.setQueryData(['my-profile'], updatedUser)
      setForm(EMPTY_FORM)
      setPassword('')
      pushToast({ type: 'success', message: t('user.profile.update_success') })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('user.profile.update_failed') })
    }
  })

  const profile = profileQuery.data
  const hasFormField = (field) => Object.prototype.hasOwnProperty.call(form, field)
  const resolvedForm = {
    username: hasFormField('username') ? form.username : profile?.username || '',
    email: hasFormField('email') ? form.email : profile?.email || '',
    avatar_url: hasFormField('avatar_url') ? form.avatar_url : profile?.avatar_url || '',
    language: hasFormField('language') ? form.language : profile?.language || 'en'
  }

  const submitProfile = (event) => {
    event.preventDefault()
    const payload = {
      username: resolvedForm.username.trim(),
      email: resolvedForm.email.trim(),
      avatar_url: resolvedForm.avatar_url.trim() || null,
      language: resolvedForm.language
    }

    if (password.trim()) {
      payload.password = password.trim()
    }

    updateMutation.mutate(payload)
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('user.profile.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('user.profile.subtitle')}</p>
      </header>

      {profileQuery.isLoading ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {profileQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {profileQuery.error?.message || t('user.profile.load_failed')}
        </p>
      ) : null}

      <form onSubmit={submitProfile} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          {t('user.profile.username')}
          <input
            value={resolvedForm.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-700">
          {t('user.profile.email')}
          <input
            value={resolvedForm.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-700">
          {t('user.profile.avatar_url')}
          <input
            value={resolvedForm.avatar_url}
            onChange={(event) => setForm((prev) => ({ ...prev, avatar_url: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-700">
          {t('user.profile.language')}
          <select
            value={resolvedForm.language}
            onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="en">{t('language.en')}</option>
            <option value="vi">{t('language.vi')}</option>
          </select>
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          {t('user.profile.password_optional')}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {t('user.profile.save_button')}
          </button>
        </div>
      </form>
    </section>
  )
}
