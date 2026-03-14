import { Link } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

export default function NotFoundPage() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-lg rounded-xl bg-white p-6 text-center shadow">
        <h2 className="text-2xl font-semibold text-slate-800">{t('not_found.title')}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('not_found.message')}
        </p>
        <Link
          to="/home"
          className="mt-5 inline-block rounded bg-slate-800 px-4 py-2 font-medium text-white"
        >
          {t('not_found.back_home')}
        </Link>
      </section>
    </div>
  )
}
