import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getReportFactById, updateReportFactStatus } from '../services/reportFactService'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'

const STATUSES = ['pending', 'reviewing', 'resolved', 'rejected']

export default function ReportDetailPage() {
  const { id } = useParams()
  const { t } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState({
    status: null,
    resolution_note: null
  })

  const reportQuery = useQuery({
    queryKey: ['report-moderation-detail', id],
    enabled: Boolean(id),
    queryFn: () =>
      getReportFactById(id, {
        errorFallbackMessage: t('admin.reports.load_detail_failed')
      })
  })

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      updateReportFactStatus(id, payload, {
        errorFallbackMessage: t('admin.reports.update_failed')
      }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.reports.update_success') })
      queryClient.invalidateQueries({ queryKey: ['report-moderation'] })
      queryClient.invalidateQueries({ queryKey: ['report-moderation-detail', id] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.reports.update_failed') })
    }
  })

  const statusOptions = useMemo(
    () =>
      STATUSES.map((status) => ({
        value: status,
        label: t(`admin.reports.status.${status}`)
      })),
    [t]
  )

  const report = reportQuery.data
  const draftStatus = draft.status ?? report?.status ?? 'pending'
  const draftResolutionNote = draft.resolution_note ?? report?.resolution_note ?? ''

  const handleApply = () => {
    updateMutation.mutate({
      status: draftStatus,
      resolution_note: draftResolutionNote.trim() || null
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.reports.detail_title')}</h2>
        <Link to="/moderation/reports" className="text-sm text-slate-700 underline">
          {t('admin.reports.back_to_list')}
        </Link>
      </div>

      {reportQuery.isLoading ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {reportQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {reportQuery.error?.message || t('admin.reports.load_detail_failed')}
        </p>
      ) : null}

      {report ? (
        <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <p>
              <span className="font-medium text-slate-700">{t('admin.reports.report_id')}:</span> {report.id}
            </p>
            <p>
              <span className="font-medium text-slate-700">{t('admin.reports.fact_id')}:</span> {report.fact_id}
            </p>
            <p>
              <span className="font-medium text-slate-700">{t('admin.reports.user_id')}:</span> {report.user_id}
            </p>
            <p>
              <span className="font-medium text-slate-700">{t('admin.reports.current_status')}:</span>{' '}
              {t(`admin.reports.status.${report.status}`)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">{t('admin.reports.reason')}</p>
            <p className="rounded bg-slate-50 p-3 text-sm text-slate-700">{report.reason}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[220px,1fr]">
            <label className="text-sm text-slate-700">
              {t('admin.reports.next_status')}
              <select
                value={draftStatus}
                onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700">
              {t('admin.reports.resolution_note')}
              <input
                value={draftResolutionNote}
                onChange={(event) => setDraft((prev) => ({ ...prev, resolution_note: event.target.value }))}
                placeholder={t('admin.reports.resolution_note_placeholder')}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={updateMutation.isPending}
            className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {t('admin.reports.apply_action')}
          </button>
        </article>
      ) : null}
    </section>
  )
}
