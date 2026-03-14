import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { getFactViewSummaryByFactId } from '../services/factViewService'

function formatDate(value) {
  if (!value) {
    return ''
  }
  return value
}

export default function FactPerformancePage() {
  const { t } = useI18n()
  const [factId, setFactId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [submittedFilters, setSubmittedFilters] = useState({
    factId: '',
    from: '',
    to: ''
  })

  const summaryQuery = useQuery({
    queryKey: ['fact-performance', submittedFilters],
    enabled: Boolean(submittedFilters.factId),
    queryFn: () =>
      getFactViewSummaryByFactId(
        submittedFilters.factId,
        {
          from: submittedFilters.from || undefined,
          to: submittedFilters.to || undefined
        },
        {
          errorFallbackMessage: t('admin.fact_performance.load_failed')
        }
      )
  })

  const byDate = useMemo(() => summaryQuery.data?.by_date ?? [], [summaryQuery.data?.by_date])

  const maxViews = useMemo(() => {
    const values = byDate.map((item) => Number(item.views || 0))
    return values.length > 0 ? Math.max(...values) : 0
  }, [byDate])

  const submitFilters = (event) => {
    event.preventDefault()
    setSubmittedFilters({
      factId: factId.trim(),
      from: fromDate,
      to: toDate
    })
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.fact_performance.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.fact_performance.subtitle')}</p>
      </header>

      <form onSubmit={submitFilters} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-slate-700 md:col-span-2">
          {t('admin.fact_performance.fact_id')}
          <input
            required
            value={factId}
            onChange={(event) => setFactId(event.target.value)}
            placeholder={t('admin.fact_performance.fact_id_placeholder')}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.fact_performance.from')}
          <input
            type="datetime-local"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.fact_performance.to')}
          <input
            type="datetime-local"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="md:col-span-4">
          <button type="submit" className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white">
            {t('admin.fact_performance.load_button')}
          </button>
        </div>
      </form>

      {summaryQuery.isFetching ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {summaryQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {summaryQuery.error?.message || t('admin.fact_performance.load_failed')}
        </p>
      ) : null}

      {summaryQuery.data ? (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded border border-slate-200 p-3">
              <p className="text-xs uppercase text-slate-500">{t('admin.fact_performance.total_views')}</p>
              <p className="text-xl font-semibold text-slate-800">{summaryQuery.data.total_views}</p>
            </article>
            <article className="rounded border border-slate-200 p-3">
              <p className="text-xs uppercase text-slate-500">{t('admin.fact_performance.unique_users')}</p>
              <p className="text-xl font-semibold text-slate-800">{summaryQuery.data.unique_users}</p>
            </article>
            <article className="rounded border border-slate-200 p-3">
              <p className="text-xs uppercase text-slate-500">{t('admin.fact_performance.unique_guests')}</p>
              <p className="text-xl font-semibold text-slate-800">{summaryQuery.data.unique_guests}</p>
            </article>
            <article className="rounded border border-slate-200 p-3">
              <p className="text-xs uppercase text-slate-500">{t('admin.fact_performance.unique_viewers')}</p>
              <p className="text-xl font-semibold text-slate-800">{summaryQuery.data.unique_viewers}</p>
            </article>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">{t('admin.fact_performance.by_date')}</h3>
            {byDate.length === 0 ? (
              <p className="text-sm text-slate-600">{t('admin.fact_performance.by_date_empty')}</p>
            ) : (
              byDate.map((item) => {
                const views = Number(item.views || 0)
                const widthPercent = maxViews > 0 ? Math.max(4, Math.round((views / maxViews) * 100)) : 0
                return (
                  <div key={item.date} className="grid items-center gap-2 md:grid-cols-[140px,1fr,60px]">
                    <span className="text-sm text-slate-600">{formatDate(item.date)}</span>
                    <div className="h-3 rounded bg-slate-100">
                      <div className="h-3 rounded bg-slate-700" style={{ width: `${widthPercent}%` }} />
                    </div>
                    <span className="text-right text-sm font-medium text-slate-700">{views}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
