import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { getAdminLogs } from '../services/adminLogService'

const ACTIONS = ['create', 'update', 'delete', 'status_update']
const TARGET_TYPES = ['fact', 'tag', 'category', 'report_fact', 'user', 'role', 'comment', 'bookmark_collection']

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
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

export default function AdminLogsPage() {
  const { t, language } = useI18n()

  const [filters, setFilters] = useState({
    admin_id: '',
    action: '',
    target_type: '',
    from: '',
    to: '',
    page: 1,
    limit: 20
  })

  const logsQuery = useQuery({
    queryKey: ['admin-logs-page', filters],
    queryFn: () =>
      getAdminLogs(
        {
          admin_id: filters.admin_id || undefined,
          action: filters.action || undefined,
          target_type: filters.target_type || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          page: filters.page,
          limit: filters.limit
        },
        {
          errorFallbackMessage: t('admin.logs.load_failed')
        }
      )
  })

  const items = logsQuery.data?.items ?? []
  const pagination = logsQuery.data?.pagination
  const page = pagination?.page ?? filters.page
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)

  const actionOptions = useMemo(
    () =>
      ACTIONS.map((action) => ({
        value: action,
        label: t(`admin.logs.action.${action}`)
      })),
    [t]
  )

  const targetOptions = useMemo(
    () =>
      TARGET_TYPES.map((targetType) => ({
        value: targetType,
        label: t(`admin.logs.target_type.${targetType}`)
      })),
    [t]
  )

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.logs.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.logs.subtitle')}</p>
      </header>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <label className="text-sm text-slate-700">
          {t('admin.logs.filter_admin_id')}
          <input
            value={filters.admin_id}
            onChange={(event) => setFilters((prev) => ({ ...prev, admin_id: event.target.value.trim(), page: 1 }))}
            placeholder={t('admin.logs.object_id_placeholder')}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.logs.filter_action')}
          <select
            value={filters.action}
            onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value, page: 1 }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.logs.all_actions')}</option>
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.logs.filter_target_type')}
          <select
            value={filters.target_type}
            onChange={(event) => setFilters((prev) => ({ ...prev, target_type: event.target.value, page: 1 }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.logs.all_target_types')}</option>
            {targetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.logs.filter_from')}
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value, page: 1 }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.logs.filter_to')}
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value, page: 1 }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.logs.filter_limit')}
          <select
            value={filters.limit}
            onChange={(event) => setFilters((prev) => ({ ...prev, limit: Number(event.target.value), page: 1 }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      {logsQuery.isLoading ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {logsQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {logsQuery.error?.message || t('admin.logs.load_failed')}
        </p>
      ) : null}

      {!logsQuery.isLoading && !logsQuery.error && items.length === 0 ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('admin.logs.empty')}</p>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((log) => (
            <article key={log.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-700">{t('admin.logs.admin_id')}:</span> {log.admin_id}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{t('admin.logs.action_label')}:</span>{' '}
                  {t(`admin.logs.action.${log.action}`)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{t('admin.logs.target_type_label')}:</span>{' '}
                  {t(`admin.logs.target_type.${log.target_type}`)}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{t('admin.logs.target_id')}:</span> {log.target_id}
                </p>
                <p className="md:col-span-2">
                  <span className="font-medium text-slate-700">{t('admin.logs.created_at')}:</span>{' '}
                  {formatDateTime(log.created_at, language) || t('common.na')}
                </p>
              </div>
              <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
                {JSON.stringify(log.meta ?? {}, null, 2)}
              </pre>
            </article>
          ))}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={page <= 1}
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
              disabled={page >= totalPages}
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
