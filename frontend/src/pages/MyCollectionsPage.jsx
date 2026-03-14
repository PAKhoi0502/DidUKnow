import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'
import {
  createBookmarkCollection,
  deleteBookmarkCollectionById,
  getMyBookmarkCollections,
  updateBookmarkCollectionById
} from '../services/bookmarkCollectionService'

export default function MyCollectionsPage() {
  const { t } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [editNameById, setEditNameById] = useState({})

  const collectionsQuery = useQuery({
    queryKey: ['my-collections'],
    queryFn: () =>
      getMyBookmarkCollections(
        { page: 1, limit: 50 },
        { errorFallbackMessage: t('user.collections.load_failed') }
      )
  })

  const createMutation = useMutation({
    mutationFn: (payload) =>
      createBookmarkCollection(payload, { errorFallbackMessage: t('user.collections.create_failed') }),
    onSuccess: () => {
      setName('')
      pushToast({ type: 'success', message: t('user.collections.create_success') })
      queryClient.invalidateQueries({ queryKey: ['my-collections'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('user.collections.create_failed') })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      updateBookmarkCollectionById(id, payload, { errorFallbackMessage: t('user.collections.update_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('user.collections.update_success') })
      queryClient.invalidateQueries({ queryKey: ['my-collections'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('user.collections.update_failed') })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      deleteBookmarkCollectionById(id, { errorFallbackMessage: t('user.collections.delete_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('user.collections.delete_success') })
      queryClient.invalidateQueries({ queryKey: ['my-collections'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('user.collections.delete_failed') })
    }
  })

  const items = collectionsQuery.data?.items ?? []

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('user.collections.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('user.collections.subtitle')}</p>
      </header>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('user.collections.name_placeholder')}
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => createMutation.mutate({ name: name.trim() })}
          disabled={createMutation.isPending || !name.trim()}
          className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white"
        >
          {t('user.collections.create_button')}
        </button>
      </div>

      {collectionsQuery.isLoading ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}
      {collectionsQuery.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {collectionsQuery.error?.message || t('user.collections.load_failed')}
        </p>
      ) : null}

      {!collectionsQuery.isLoading && !collectionsQuery.error && items.length === 0 ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('user.collections.empty')}</p>
      ) : null}

      {items.map((item) => {
        const editName = editNameById[item.id] ?? item.name
        return (
          <article key={item.id} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr,auto]">
            <input
              value={editName}
              onChange={(event) =>
                setEditNameById((prev) => ({ ...prev, [item.id]: event.target.value }))
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateMutation.mutate({ id: item.id, payload: { name: editName.trim() } })}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {t('comments.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('user.collections.delete_confirm'))) {
                    deleteMutation.mutate(item.id)
                  }
                }}
                className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
              >
                {t('comments.delete')}
              </button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
