import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { useAuthDomain } from '../hooks/domains/useAuthDomain'
import { useCollectionsDomain } from '../hooks/domains/useCollectionsDomain'
import { useCommentsDomain } from '../hooks/domains/useCommentsDomain'
import { useFactsDomain } from '../hooks/domains/useFactsDomain'
import { useFavouritesDomain } from '../hooks/domains/useFavouritesDomain'
import { queryKeys } from '../hooks/domains/queryKeys'
import { useReportsDomain } from '../hooks/domains/useReportsDomain'
import { useToast } from '../hooks/toastContext'
import { useI18n } from '../utils/i18n'
import { normalizeApiError } from '../utils/normalizeApiError'

const DEFAULT_COMMENT_LIMIT = 5
const EMPTY_LIST = []

function FactContent({ fact, t }) {
  const images = fact?.content?.images || []

  return (
    <article className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs text-slate-500">{t('facts.detail.fact_id')}: {fact.id}</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-800">{fact.title}</h2>
        <p className="mt-2 text-slate-600">{fact.short_fact}</p>
      </div>

      <div className="space-y-3 text-slate-700">
        <section>
          <h3 className="font-semibold text-slate-800">{t('facts.detail.intro')}</h3>
          <p className="mt-1 whitespace-pre-wrap">{fact.content?.intro || '-'}</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800">{t('facts.detail.body')}</h3>
          <p className="mt-1 whitespace-pre-wrap">{fact.content?.body || '-'}</p>
        </section>

        <section>
          <h3 className="font-semibold text-slate-800">{t('facts.detail.conclusion')}</h3>
          <p className="mt-1 whitespace-pre-wrap">{fact.content?.conclusion || '-'}</p>
        </section>
      </div>

      {images.length > 0 && (
        <section>
          <h3 className="font-semibold text-slate-800">{t('facts.detail.images')}</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {images.map((image, index) => (
              <figure key={`${fact.id}-img-${index}`} className="rounded border border-slate-200 p-2">
                <img
                  src={image.url}
                  alt={image.alt || `fact-image-${index + 1}`}
                  className="h-48 w-full rounded object-cover"
                />
                {(image.caption || image.alt) && (
                  <figcaption className="mt-2 text-xs text-slate-500">
                    {image.caption || image.alt}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export default function FactDetailPage() {
  const { id } = useParams()
  const { user } = useAuthDomain()
  const { language, t } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()
  const { fetchFactById } = useFactsDomain()
  const { fetchFavouriteStatus, addFavouriteAction, removeFavouriteAction } = useFavouritesDomain()
  const {
    fetchCollections,
    createCollectionAction,
    fetchCollectionFacts,
    addFactToCollectionAction,
    removeFactFromCollectionAction
  } = useCollectionsDomain()
  const { createReportAction } = useReportsDomain()
  const { fetchCommentsByFactId, createCommentAction, updateCommentAction, deleteCommentAction } =
    useCommentsDomain()
  const currentUserId = user?.id ? String(user.id) : ''
  const [comments, setComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsPagination, setCommentsPagination] = useState({
    page: commentsPage,
    limit: DEFAULT_COMMENT_LIMIT,
    total: 0,
    total_pages: 1
  })
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isFavourited, setIsFavourited] = useState(false)
  const [isMutatingFavourite, setIsMutatingFavourite] = useState(false)
  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isMutatingBookmark, setIsMutatingBookmark] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState('')
  const [editingCommentText, setEditingCommentText] = useState('')
  const [updatingCommentId, setUpdatingCommentId] = useState('')
  const [deletingCommentId, setDeletingCommentId] = useState('')

  const factQuery = useQuery({
    queryKey: queryKeys.factDetail(id, language),
    queryFn: () => fetchFactById({ factId: id, language, errorFallbackMessage: t('facts.detail.error') })
  })

  const commentsQuery = useQuery({
    queryKey: queryKeys.comments(id, { page: commentsPage, limit: DEFAULT_COMMENT_LIMIT }),
    queryFn: () =>
      fetchCommentsByFactId({
        factId: id,
        params: { page: commentsPage, limit: DEFAULT_COMMENT_LIMIT },
        errorFallbackMessage: t('facts.error.load_comments')
      }),
    placeholderData: keepPreviousData
  })

  const collectionsQuery = useQuery({
    queryKey: queryKeys.collections({ page: 1, limit: 30 }),
    queryFn: () =>
      fetchCollections({
        params: { page: 1, limit: 30 },
        errorFallbackMessage: t('interactions.collections_load_failed')
      }),
    enabled: Boolean(currentUserId)
  })

  const favouriteStatusQuery = useQuery({
    queryKey: queryKeys.favouritesCheck(id),
    queryFn: () =>
      fetchFavouriteStatus({
        factId: id,
        errorFallbackMessage: t('interactions.favourite_status_failed')
      }),
    enabled: Boolean(currentUserId)
  })

  const bookmarkStatusQuery = useQuery({
    queryKey: queryKeys.collectionFacts(selectedCollectionId, { page: 1, limit: 100 }),
    queryFn: () =>
      fetchCollectionFacts({
        collectionId: selectedCollectionId,
        params: { page: 1, limit: 100 },
        errorFallbackMessage: t('interactions.bookmark_status_failed')
      }),
    enabled: Boolean(currentUserId && selectedCollectionId)
  })

  const fact = factQuery.data || null
  const isLoadingFact = factQuery.isPending
  const factError = factQuery.error ? normalizeApiError(factQuery.error) : ''
  const isLoadingComments = commentsQuery.isPending
  const commentError = commentsQuery.error ? normalizeApiError(commentsQuery.error) : ''
  const collections = useMemo(() => collectionsQuery.data?.items ?? EMPTY_LIST, [collectionsQuery.data])
  const isLoadingBookmarkStatus = bookmarkStatusQuery.isFetching

  const createCommentMutation = useMutation({
    mutationFn: ({ payload, errorFallbackMessage }) =>
      createCommentAction({ payload, errorFallbackMessage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] })
    }
  })

  const toggleFavouriteMutation = useMutation({
    mutationFn: ({ nextValue }) => {
      if (nextValue) {
        return addFavouriteAction({ factId: id, errorFallbackMessage: t('interactions.favourite_add_failed') })
      }
      return removeFavouriteAction({
        factId: id,
        errorFallbackMessage: t('interactions.favourite_remove_failed')
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favouritesCheck(id) })
    }
  })

  const createCollectionMutation = useMutation({
    mutationFn: ({ name }) =>
      createCollectionAction({
        payload: { name },
        errorFallbackMessage: t('interactions.collection_create_failed')
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections({ page: 1, limit: 30 }) })
    }
  })

  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ nextValue }) => {
      if (nextValue) {
        return addFactToCollectionAction({
          payload: { collection_id: selectedCollectionId, fact_id: id },
          errorFallbackMessage: t('interactions.bookmark_add_failed')
        })
      }
      return removeFactFromCollectionAction({
        collectionId: selectedCollectionId,
        factId: id,
        errorFallbackMessage: t('interactions.bookmark_remove_failed')
      })
    },
    onSettled: () => {
      if (!selectedCollectionId) {
        return
      }
      queryClient.invalidateQueries({ queryKey: ['collection-facts', selectedCollectionId] })
    }
  })

  const reportMutation = useMutation({
    mutationFn: ({ payload }) =>
      createReportAction({
        payload,
        errorFallbackMessage: t('interactions.report_failed')
      })
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, payload }) =>
      updateCommentAction({
        commentId,
        payload,
        errorFallbackMessage: t('comments.update_failed')
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] })
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }) =>
      deleteCommentAction({ commentId, errorFallbackMessage: t('comments.delete_failed') }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] })
    }
  })

  useEffect(() => {
    if (!commentsQuery.data) {
      return
    }
    setComments(commentsQuery.data.items || [])
    setCommentsPagination(
      commentsQuery.data.pagination || {
        page: commentsPage,
        limit: DEFAULT_COMMENT_LIMIT,
        total: 0,
        total_pages: 1
      }
    )
  }, [commentsPage, commentsQuery.data])

  useEffect(() => {
    if (!collections.length) {
      return
    }
    setSelectedCollectionId((prev) => prev || String(collections[0].id))
  }, [collections])

  useEffect(() => {
    if (!favouriteStatusQuery.data) {
      return
    }
    setIsFavourited(Boolean(favouriteStatusQuery.data?.is_favourited))
  }, [favouriteStatusQuery.data])

  useEffect(() => {
    if (!bookmarkStatusQuery.data) {
      if (!selectedCollectionId) {
        setIsBookmarked(false)
      }
      return
    }
    const exists = (bookmarkStatusQuery.data.items || []).some((item) => String(item.fact_id) === String(id))
    setIsBookmarked(exists)
  }, [bookmarkStatusQuery.data, id, selectedCollectionId])

  const handleSubmitComment = async (event) => {
    event.preventDefault()
    if (!commentText.trim()) {
      pushToast({
        type: 'error',
        message: t('comments.content_required')
      })
      return
    }

    try {
      setIsSubmittingComment(true)
      await createCommentMutation.mutateAsync({
        payload: {
          fact_id: id,
          content: commentText.trim()
        },
        errorFallbackMessage: t('comments.post_failed')
      })
      setCommentText('')
      pushToast({
        type: 'success',
        message: t('comments.post_success')
      })
      setCommentsPage(1)
      await commentsQuery.refetch()
    } catch (err) {
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentsPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > (commentsPagination.total_pages || 1)) {
      return
    }

    setCommentsPage(nextPage)
  }

  const handleToggleFavourite = async () => {
    if (isMutatingFavourite) {
      return
    }

    const nextValue = !isFavourited
    setIsFavourited(nextValue)
    setIsMutatingFavourite(true)

    try {
      await toggleFavouriteMutation.mutateAsync({ nextValue })
      if (nextValue) {
        pushToast({ type: 'success', message: t('interactions.favourite_added') })
      } else {
        pushToast({ type: 'success', message: t('interactions.favourite_removed') })
      }
    } catch (err) {
      setIsFavourited(!nextValue)
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setIsMutatingFavourite(false)
    }
  }

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim()
    if (!name) {
      pushToast({
        type: 'error',
        message: t('interactions.collection_name_required')
      })
      return
    }

    try {
      setIsCreatingCollection(true)
      const collection = await createCollectionMutation.mutateAsync({ name })
      await collectionsQuery.refetch()
      setSelectedCollectionId(String(collection.id))
      setNewCollectionName('')
      pushToast({
        type: 'success',
        message: t('interactions.collection_created')
      })
    } catch (err) {
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setIsCreatingCollection(false)
    }
  }

  const handleToggleBookmark = async () => {
    if (isMutatingBookmark || !selectedCollectionId) {
      if (!selectedCollectionId) {
        pushToast({
          type: 'error',
          message: t('interactions.select_collection_required')
        })
      }
      return
    }

    const nextValue = !isBookmarked
    setIsBookmarked(nextValue)
    setIsMutatingBookmark(true)

    try {
      await toggleBookmarkMutation.mutateAsync({ nextValue })
      if (nextValue) {
        pushToast({ type: 'success', message: t('interactions.bookmark_added') })
      } else {
        pushToast({ type: 'success', message: t('interactions.bookmark_removed') })
      }
    } catch (err) {
      setIsBookmarked(!nextValue)
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setIsMutatingBookmark(false)
    }
  }

  const handleSubmitReport = async (event) => {
    event.preventDefault()
    if (!reportReason.trim()) {
      pushToast({
        type: 'error',
        message: t('interactions.report_reason_required')
      })
      return
    }

    try {
      setIsSubmittingReport(true)
      await reportMutation.mutateAsync({
        payload: {
          fact_id: id,
          reason: reportReason.trim()
        }
      })
      setReportReason('')
      pushToast({ type: 'success', message: t('interactions.report_success') })
    } catch (err) {
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setIsSubmittingReport(false)
    }
  }

  const isOwnComment = (comment) => {
    const commentUserId = String(comment.user?.id || comment.user_id || '')
    return Boolean(currentUserId && commentUserId && currentUserId === commentUserId)
  }

  const startEditComment = (comment) => {
    setEditingCommentId(String(comment.id))
    setEditingCommentText(comment.content || '')
  }

  const cancelEditComment = () => {
    setEditingCommentId('')
    setEditingCommentText('')
  }

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      pushToast({
        type: 'error',
        message: t('comments.content_required')
      })
      return
    }

    try {
      setUpdatingCommentId(String(commentId))
      const updated = await updateCommentMutation.mutateAsync({
        commentId,
        payload: { content: editingCommentText.trim() }
      })
      setComments((prev) =>
        prev.map((comment) => (String(comment.id) === String(commentId) ? { ...comment, ...updated } : comment))
      )
      cancelEditComment()
      pushToast({
        type: 'success',
        message: t('comments.update_success')
      })
    } catch (err) {
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setUpdatingCommentId('')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingCommentId(String(commentId))
      await deleteCommentMutation.mutateAsync({ commentId })
      setComments((prev) => prev.filter((comment) => String(comment.id) !== String(commentId)))
      setCommentsPagination((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 0) - 1)
      }))
      pushToast({
        type: 'success',
        message: t('comments.delete_success')
      })
    } catch (err) {
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setDeletingCommentId('')
    }
  }

  return (
    <section className="space-y-4">
      <Link to="/home" className="text-sm font-medium text-slate-700 underline">
        {t('facts.detail.back_home')}
      </Link>

      {isLoadingFact && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">{t('facts.detail.loading')}</p>
        </div>
      )}

      {!isLoadingFact && factError && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="rounded bg-red-100 p-3 text-sm text-red-700">{factError}</p>
        </div>
      )}

      {!isLoadingFact && !factError && fact && <FactContent fact={fact} t={t} />}

      {!isLoadingFact && !factError && fact && (
        <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">{t('interactions.title')}</h3>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavourite}
              disabled={isMutatingFavourite}
              className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
            >
              {isFavourited ? t('interactions.unlike') : t('interactions.like')}
            </button>
          </div>

          <div className="space-y-2 rounded border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">{t('interactions.bookmark_title')}</p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCollectionId}
                onChange={(event) => setSelectedCollectionId(event.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t('interactions.select_collection')}</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleToggleBookmark}
                disabled={isMutatingBookmark || isLoadingBookmarkStatus || !selectedCollectionId}
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
              >
                {isBookmarked ? t('interactions.remove_bookmark') : t('interactions.add_bookmark')}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newCollectionName}
                onChange={(event) => setNewCollectionName(event.target.value)}
                placeholder={t('interactions.new_collection_placeholder')}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleCreateCollection}
                disabled={isCreatingCollection}
                className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isCreatingCollection ? t('common.loading') : t('interactions.create_collection')}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-2 rounded border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-700">{t('interactions.report_title')}</p>
            <textarea
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder={t('interactions.report_placeholder')}
              rows={3}
              className="w-full rounded border border-slate-300 p-3 text-sm outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              disabled={isSubmittingReport}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isSubmittingReport ? t('common.loading') : t('interactions.report_submit')}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">{t('comments.title')}</h3>

        <form className="mt-3 space-y-3" onSubmit={handleSubmitComment}>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={t('comments.placeholder')}
            className="w-full rounded border border-slate-300 p-3 text-sm outline-none focus:border-slate-500"
            rows={3}
          />

          <button
            type="submit"
            disabled={isSubmittingComment}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSubmittingComment ? t('comments.posting') : t('comments.post_button')}
          </button>
        </form>

        {commentError && (
          <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{commentError}</p>
        )}

        {isLoadingComments && <p className="mt-4 text-sm text-slate-600">{t('common.loading')}</p>}

        {!isLoadingComments && !commentError && comments.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">{t('comments.none')}</p>
        )}

        {!isLoadingComments && comments.length > 0 && (
          <>
            <div className="mt-4 space-y-3">
              {comments.map((comment) => (
                <article key={comment.id} className="rounded border border-slate-200 p-3">
                  {editingCommentId === String(comment.id) ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingCommentText}
                        onChange={(event) => setEditingCommentText(event.target.value)}
                        rows={3}
                        className="w-full rounded border border-slate-300 p-2 text-sm outline-none focus:border-slate-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={updatingCommentId === String(comment.id)}
                          className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
                        >
                          {updatingCommentId === String(comment.id)
                            ? t('common.loading')
                            : t('comments.save')}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditComment}
                          className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700"
                        >
                          {t('comments.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {t('layout.user')}: {comment.user?.username || comment.user_id} |{' '}
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                  {isOwnComment(comment) && editingCommentId !== String(comment.id) && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditComment(comment)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
                      >
                        {t('comments.edit')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === String(comment.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 disabled:opacity-60"
                      >
                        {deletingCommentId === String(comment.id)
                          ? t('common.loading')
                          : t('comments.delete')}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCommentsPageChange(commentsPagination.page - 1)}
                disabled={commentsPagination.page <= 1}
                className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
              >
                {t('common.prev')}
              </button>
              <p className="text-sm text-slate-600">
                {t('common.page')} {commentsPagination.page} / {commentsPagination.total_pages || 1}
              </p>
              <button
                type="button"
                onClick={() => handleCommentsPageChange(commentsPagination.page + 1)}
                disabled={commentsPagination.page >= (commentsPagination.total_pages || 1)}
                className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          </>
        )}
      </section>
    </section>
  )
}
