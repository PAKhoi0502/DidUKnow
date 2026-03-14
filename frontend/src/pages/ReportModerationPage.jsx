import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getReportFacts } from '../services/reportFactService'
import { useI18n } from '../utils/i18n'

const STATUSES = ['pending', 'reviewing', 'resolved', 'rejected']

function getStatusBadgeClass(status) {
  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-700'
  }

  if (status === 'reviewing') {
    return 'border-blue-200 bg-blue-50 text-blue-700'
  }

  if (status === 'resolved') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'rejected') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function formatDateTime(value, language) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default function ReportModerationPage() {
  const { t, language } = useI18n()

  const [filters, setFilters] = useState({
    status: '',
    fact_id: '',
    user_id: '',
    page: 1,
    limit: 10
  })
  const reportsQuery = useQuery({
    queryKey: ['report-moderation', filters],
    queryFn: () =>
      getReportFacts(
        {
          status: filters.status || undefined,
          fact_id: filters.fact_id || undefined,
          user_id: filters.user_id || undefined,
          page: filters.page,
          limit: filters.limit
        },
        { errorFallbackMessage: t('admin.reports.load_failed') }
      )
  })

  const items = reportsQuery.data?.items ?? []
  const pagination = reportsQuery.data?.pagination
  const page = pagination?.page ?? filters.page
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  const statusOptions = useMemo(
    () =>
      STATUSES.map((status) => ({
        value: status,
        label: t(`admin.reports.status.${status}`)
      })),
    [t]
  )

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.reports.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.reports.subtitle')}</p>
      </header>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-slate-700">
          {t('admin.reports.filter_status')}
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value, page: 1 }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.reports.all_statuses')}</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.reports.filter_fact_id')}
          <input
            value={filters.fact_id}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, fact_id: event.target.value.trim(), page: 1 }))
            }
            placeholder={t('admin.reports.id_placeholder')}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.reports.filter_user_id')}
          <input
            value={filters.user_id}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, user_id: event.target.value.trim(), page: 1 }))
            }
            placeholder={t('admin.reports.id_placeholder')}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.reports.filter_limit')}
          <select
            value={filters.limit}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, limit: Number(event.target.value), page: 1 }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </label>
      </div>

      {reportsQuery.isLoading ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {reportsQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reportsQuery.error?.message || t('admin.reports.load_failed')}
        </p>
      ) : null}

      {!reportsQuery.isLoading && !reportsQuery.error && items.length === 0 ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('admin.reports.empty')}</p>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((report) => {
            return (
              <article key={report.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p>
                    <span className="font-medium text-slate-700">{t('admin.reports.report_id')}:</span>{' '}
                    {report.id}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">{t('admin.reports.fact_id')}:</span>{' '}
                    {report.fact_id}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">{t('admin.reports.user_id')}:</span>{' '}
                    {report.user_id}
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">{t('admin.reports.current_status')}:</span>{' '}
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        report.status
                      )}`}
                    >
                      {t(`admin.reports.status.${report.status}`)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">{t('admin.reports.updated_at')}:</span>{' '}
                    {formatDateTime(report.updated_at, language) || t('common.na')}
                  </p>
                </div>

                <p className="mt-2 rounded bg-slate-50 p-3 text-sm text-slate-700">{report.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={`/facts/${report.fact_id}`}
                    className="inline-flex rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {t('admin.reports.view_fact_detail')}
                  </Link>
                  <Link
                    to={`/moderation/reports/${report.id}`}
                    className="inline-flex rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    {t('admin.reports.view_detail')}
                  </Link>
                </div>
              </article>
            )
          })}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              {t('common.prev')}
            </button>
            <span className="text-sm text-slate-600">
              {t('facts.page_info', `Page ${page} / ${totalPages}`)
                .replace('{page}', String(page))
                .replace('{total_pages}', String(totalPages))}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
