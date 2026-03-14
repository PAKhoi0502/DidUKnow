import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { getMyFavourites } from '../services/favouriteService'

export default function MyFavouritesPage() {
  const { t } = useI18n()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const favouritesQuery = useQuery({
    queryKey: ['my-favourites', page, limit],
    queryFn: () =>
      getMyFavourites(
        { page, limit },
        { errorFallbackMessage: t('user.favourites.load_failed') }
      )
  })

  const items = favouritesQuery.data?.items ?? []
  const pagination = favouritesQuery.data?.pagination
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)
  const currentPage = pagination?.page ?? page

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('user.favourites.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('user.favourites.subtitle')}</p>
      </header>

      {favouritesQuery.isLoading ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}
      {favouritesQuery.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {favouritesQuery.error?.message || t('user.favourites.load_failed')}
        </p>
      ) : null}

      {!favouritesQuery.isLoading && !favouritesQuery.error && items.length === 0 ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('user.favourites.empty')}</p>
      ) : null}

      {items.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium">{t('facts.detail.fact_id')}:</span> {item.fact_id}
          </p>
          <div className="mt-2">
            <Link
              to={`/facts/${item.fact_id}`}
              className="inline-flex rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {t('facts.detail.view')}
            </Link>
          </div>
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
