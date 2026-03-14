import { Link } from 'react-router-dom'
import { useI18n } from '../utils/i18n'

export default function FactsPage() {
  const { t } = useI18n()

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">{t('facts.title')}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {t('facts.facts_page.subtitle')}
      </p>
      <Link to="/home" className="mt-3 inline-block text-sm font-medium text-slate-800 underline">
        {t('facts.facts_page.go_home')}
      </Link>
    </section>
  )
}
