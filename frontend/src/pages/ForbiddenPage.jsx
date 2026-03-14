import { Link } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

export default function ForbiddenPage() {
  const { t } = useI18n()

  return (
    <section className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-red-700">{t('forbidden.title')}</h2>
      <p className="mt-2 text-sm text-slate-600">{t('forbidden.message')}</p>
      <Link
        to="/home"
        className="mt-5 inline-flex rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {t('forbidden.back_home')}
      </Link>
    </section>
  )
}
