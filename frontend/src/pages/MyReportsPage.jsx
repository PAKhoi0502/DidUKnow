import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { getMyReportFacts } from '../services/reportFactService'

const STATUSES = ['pending', 'reviewing', 'resolved', 'rejected']

export default function MyReportsPage() {
  const { t } = useI18n()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const reportsQuery = useQuery({
    queryKey: ['my-reports', status, page, limit],
    queryFn: () =>
      getMyReportFacts(
        {
          status: status || undefined,
          page,
          limit
        },
        {
          errorFallbackMessage: t('user.reports.load_failed')
        }
      )
  })

  const items = reportsQuery.data?.items ?? []
  const pagination = reportsQuery.data?.pagination
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)
  const currentPage = pagination?.page ?? page

  const statusOptions = useMemo(
    () =>
      STATUSES.map((value) => ({
        value,
        label: t(`admin.reports.status.${value}`)
      })),
    [t]
  )

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('user.reports.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('user.reports.subtitle')}</p>
      </header>

      <label className="block rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        {t('user.reports.filter_status')}
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 md:w-72"
        >
          <option value="">{t('admin.reports.all_statuses')}</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {reportsQuery.isLoading ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}
      {reportsQuery.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reportsQuery.error?.message || t('user.reports.load_failed')}
        </p>
      ) : null}

      {!reportsQuery.isLoading && !reportsQuery.error && items.length === 0 ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('user.reports.empty')}</p>
      ) : null}

      {items.map((item) => (
        <article key={item.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">{item.reason}</p>
          <p className="text-xs text-slate-500">
            <span className="font-medium">{t('admin.reports.current_status')}:</span>{' '}
            {t(`admin.reports.status.${item.status}`)}
          </p>
          <Link
            to={`/facts/${item.fact_id}`}
            className="inline-flex rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            {t('admin.reports.view_fact_detail')}
          </Link>
        </article>
      ))}

      <div className="flex items-center justify-end gap-2">
        <select
          value={limit}
          onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          {t('common.prev')}
        </button>
        <span className="text-sm text-slate-600">
          {t('facts.page_info').replace('{page}', String(currentPage)).replace('{total_pages}', String(totalPages))}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          {t('common.next')}
        </button>
      </div>
    </section>
  )
}
