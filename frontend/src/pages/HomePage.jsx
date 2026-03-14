import { useEffect, useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { useCollectionsDomain } from '../hooks/domains/useCollectionsDomain'
import { useFactsDomain } from '../hooks/domains/useFactsDomain'
import { useFavouritesDomain } from '../hooks/domains/useFavouritesDomain'
import { queryKeys } from '../hooks/domains/queryKeys'
import { useToast } from '../hooks/toastContext'
import { useI18n } from '../utils/i18n'
import { normalizeApiError } from '../utils/normalizeApiError'

const DEFAULT_LIMIT = 6
const EMPTY_LIST = []

function FactCard({
  fact,
  categoryMap,
  tagMap,
  t,
  isFavourited,
  isBookmarked,
  isTogglingFavourite,
  isTogglingBookmark,
  onToggleFavourite,
  onToggleBookmark
}) {
  const tags = (fact.tag_ids || []).map((tagId) => tagMap.get(String(tagId))).filter(Boolean)

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">
        {categoryMap.get(String(fact.category_id)) || t('facts.category.uncategorized')}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-800">{fact.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{fact.short_fact}</p>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tagName) => (
            <span
              key={`${fact.id}-${tagName}`}
              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
            >
              #{tagName}
            </span>
          ))}
        </div>
      )}

      <Link
        to={`/facts/${fact.id}`}
        className="mt-4 inline-block text-sm font-medium text-slate-800 underline"
      >
        {t('facts.detail.view')}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleFavourite(fact.id)}
          disabled={isTogglingFavourite}
          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-60"
        >
          {isFavourited ? t('interactions.unlike') : t('interactions.like')}
        </button>
        <button
          type="button"
          onClick={() => onToggleBookmark(fact.id)}
          disabled={isTogglingBookmark}
          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-60"
        >
          {isBookmarked ? t('interactions.remove_bookmark') : t('interactions.add_bookmark')}
        </button>
      </div>
    </article>
  )
}

export default function HomePage() {
  const { language, t } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()
  const { fetchCategories, fetchTags, fetchFacts, fetchRandomFact } = useFactsDomain()
  const { fetchFavouriteStatus, addFavouriteAction, removeFavouriteAction } = useFavouritesDomain()
  const {
    fetchCollections,
    fetchCollectionFacts,
    addFactToCollectionAction,
    removeFactFromCollectionAction
  } = useCollectionsDomain()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategoryId = searchParams.get('category_id') || ''
  const initialTagId = searchParams.get('tag_id') || ''
  const initialLanguage = searchParams.get('lang') || language
  const initialPage = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1)

  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [favouriteByFactId, setFavouriteByFactId] = useState({})
  const [bookmarkByFactId, setBookmarkByFactId] = useState({})
  const [favouriteLoadingByFactId, setFavouriteLoadingByFactId] = useState({})
  const [bookmarkLoadingByFactId, setBookmarkLoadingByFactId] = useState({})
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [randomExcludeId, setRandomExcludeId] = useState('')
  const [randomSeed, setRandomSeed] = useState(0)
  const [filters, setFilters] = useState({
    category_id: initialCategoryId,
    tag_id: initialTagId,
    language: initialLanguage,
    page: initialPage
  })

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(filters.language),
    queryFn: () =>
      fetchCategories({
        language: filters.language,
        errorFallbackMessage: t('facts.error.load_filters')
      })
  })

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags(),
    queryFn: () =>
      fetchTags({
        errorFallbackMessage: t('facts.error.load_filters')
      })
  })

  const factsQuery = useQuery({
    queryKey: queryKeys.facts({
      page: filters.page,
      limit: DEFAULT_LIMIT,
      search: debouncedSearch || undefined,
      category_id: filters.category_id || undefined,
      tag_id: filters.tag_id || undefined,
      lang: filters.language
    }),
    queryFn: () =>
      fetchFacts({
        params: {
          page: filters.page,
          limit: DEFAULT_LIMIT,
          search: debouncedSearch || undefined,
          category_id: filters.category_id || undefined,
          tag_id: filters.tag_id || undefined,
          lang: filters.language
        },
        errorFallbackMessage: t('facts.error.load_list')
      }),
    placeholderData: keepPreviousData
  })

  const randomFactQuery = useQuery({
    queryKey: queryKeys.randomFact({
      category_id: filters.category_id || undefined,
      tag_id: filters.tag_id || undefined,
      lang: filters.language,
      exclude_id: randomExcludeId || undefined,
      seed: randomSeed
    }),
    queryFn: () =>
      fetchRandomFact({
        params: {
          category_id: filters.category_id || undefined,
          tag_id: filters.tag_id || undefined,
          lang: filters.language,
          exclude_id: randomExcludeId || undefined
        },
        errorFallbackMessage: t('facts.error.load_random')
      })
  })

  const collectionsQuery = useQuery({
    queryKey: queryKeys.collections({ page: 1, limit: 30 }),
    queryFn: () =>
      fetchCollections({
        params: { page: 1, limit: 30 },
        errorFallbackMessage: t('interactions.collections_load_failed')
      })
  })

  const categories = useMemo(() => categoriesQuery.data ?? EMPTY_LIST, [categoriesQuery.data])
  const tags = useMemo(() => tagsQuery.data ?? EMPTY_LIST, [tagsQuery.data])
  const facts = useMemo(() => factsQuery.data?.items ?? EMPTY_LIST, [factsQuery.data])
  const pagination = factsQuery.data?.pagination || {
    page: filters.page,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 1
  }
  const collections = useMemo(() => collectionsQuery.data?.items ?? EMPTY_LIST, [collectionsQuery.data])
  const randomFact = randomFactQuery.data?.data || null
  const randomMeta = randomFactQuery.data?.meta || null
  const isLoadingFacts = factsQuery.isPending
  const isLoadingFilters = categoriesQuery.isPending || tagsQuery.isPending
  const isLoadingRandom = randomFactQuery.isFetching
  const isLoadingCollections = collectionsQuery.isPending
  const error = factsQuery.error
    ? normalizeApiError(factsQuery.error)
    : categoriesQuery.error
      ? normalizeApiError(categoriesQuery.error)
      : tagsQuery.error
        ? normalizeApiError(tagsQuery.error)
        : ''
  const randomError = randomFactQuery.error ? normalizeApiError(randomFactQuery.error) : ''

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [String(category.id), category.name]))
  }, [categories])

  const tagMap = useMemo(() => {
    return new Map(tags.map((tag) => [String(tag.id), tag.name]))
  }, [tags])

  useEffect(() => {
    setFilters((prev) => {
      if (prev.language === language) {
        return prev
      }

      return {
        ...prev,
        language,
        page: 1
      }
    })
  }, [language])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setFilters((prev) => ({
        ...prev,
        page: 1
      }))
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    if (!selectedCollectionId && collections.length > 0) {
      setSelectedCollectionId(String(collections[0].id))
    }
  }, [collections, selectedCollectionId])

  useEffect(() => {
    const ids = facts.map((fact) => String(fact.id))
    if (ids.length === 0) {
      setFavouriteByFactId({})
      return
    }

    let isMounted = true
    Promise.allSettled(
      ids.map((factId) =>
        fetchFavouriteStatus({
          factId,
          errorFallbackMessage: t('interactions.favourite_status_failed')
        })
      )
    ).then((results) => {
      if (!isMounted) {
        return
      }
      const nextMap = {}
      let hasError = false
      results.forEach((result, index) => {
        const factId = ids[index]
        if (result.status === 'fulfilled') {
          nextMap[factId] = Boolean(result.value?.is_favourited)
        } else {
          hasError = true
          nextMap[factId] = false
        }
      })
      setFavouriteByFactId(nextMap)
      if (hasError) {
        pushToast({
          type: 'error',
          message: t('interactions.favourite_status_failed')
        })
      }
    })
    return () => {
      isMounted = false
    }
  }, [facts, fetchFavouriteStatus, pushToast, t])

  useEffect(() => {
    const ids = facts.map((fact) => String(fact.id))
    if (ids.length === 0 || !selectedCollectionId) {
      setBookmarkByFactId({})
      return
    }

    let isMounted = true
    fetchCollectionFacts({
      collectionId: selectedCollectionId,
      params: { page: 1, limit: 200 },
      errorFallbackMessage: t('interactions.bookmark_status_failed')
    })
      .then((data) => {
        if (!isMounted) {
          return
        }
        const factIdsInCollection = new Set((data.items || []).map((item) => String(item.fact_id)))
        const nextMap = {}
        ids.forEach((factId) => {
          nextMap[factId] = factIdsInCollection.has(factId)
        })
        setBookmarkByFactId(nextMap)
      })
      .catch((err) => {
        if (!isMounted) {
          return
        }
        setBookmarkByFactId({})
        pushToast({
          type: 'error',
          message: normalizeApiError(err)
        })
      })

    return () => {
      isMounted = false
    }
  }, [facts, fetchCollectionFacts, pushToast, selectedCollectionId, t])

  useEffect(() => {
    const params = new URLSearchParams()

    if (searchInput.trim()) {
      params.set('search', searchInput.trim())
    }
    if (filters.category_id) {
      params.set('category_id', filters.category_id)
    }
    if (filters.tag_id) {
      params.set('tag_id', filters.tag_id)
    }
    if (filters.language) {
      params.set('lang', filters.language)
    }
    if (filters.page > 1) {
      params.set('page', String(filters.page))
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true })
    }
  }, [searchInput, filters, searchParams, setSearchParams])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1
    }))
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > (pagination.total_pages || 1)) {
      return
    }

    setFilters((prev) => ({
      ...prev,
      page: nextPage
    }))
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      pushToast({
        type: 'success',
        message: t('toast.filter_link_copied')
      })
    } catch {
      pushToast({
        type: 'error',
        message: t('toast.copy_failed')
      })
    }
  }

  const toggleFavouriteMutation = useMutation({
    mutationFn: async ({ factId, next }) => {
      if (next) {
        await addFavouriteAction({
          factId,
          errorFallbackMessage: t('interactions.favourite_add_failed')
        })
      } else {
        await removeFavouriteAction({
          factId,
          errorFallbackMessage: t('interactions.favourite_remove_failed')
        })
      }
      return { next }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.favouritesCheck(variables.factId)
      })
    }
  })

  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({ factId, next }) => {
      if (next) {
        await addFactToCollectionAction({
          payload: { collection_id: selectedCollectionId, fact_id: factId },
          errorFallbackMessage: t('interactions.bookmark_add_failed')
        })
      } else {
        await removeFactFromCollectionAction({
          collectionId: selectedCollectionId,
          factId,
          errorFallbackMessage: t('interactions.bookmark_remove_failed')
        })
      }
      return { next }
    },
    onSettled: () => {
      if (!selectedCollectionId) {
        return
      }
      queryClient.invalidateQueries({
        queryKey: ['collection-facts', selectedCollectionId]
      })
    }
  })

  const handleToggleFavourite = async (factId) => {
    if (favouriteLoadingByFactId[factId]) {
      return
    }

    const previous = Boolean(favouriteByFactId[factId])
    const next = !previous

    setFavouriteByFactId((prev) => ({ ...prev, [factId]: next }))
    setFavouriteLoadingByFactId((prev) => ({ ...prev, [factId]: true }))

    try {
      const result = await toggleFavouriteMutation.mutateAsync({ factId, next })
      if (result.next) {
        pushToast({
          type: 'success',
          message: t('interactions.favourite_added')
        })
      } else {
        pushToast({
          type: 'success',
          message: t('interactions.favourite_removed')
        })
      }
    } catch (err) {
      setFavouriteByFactId((prev) => ({ ...prev, [factId]: previous }))
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setFavouriteLoadingByFactId((prev) => ({ ...prev, [factId]: false }))
    }
  }

  const handleToggleBookmark = async (factId) => {
    if (!selectedCollectionId) {
      pushToast({
        type: 'error',
        message: t('interactions.select_collection_required')
      })
      return
    }

    if (bookmarkLoadingByFactId[factId]) {
      return
    }

    const previous = Boolean(bookmarkByFactId[factId])
    const next = !previous

    setBookmarkByFactId((prev) => ({ ...prev, [factId]: next }))
    setBookmarkLoadingByFactId((prev) => ({ ...prev, [factId]: true }))

    try {
      const result = await toggleBookmarkMutation.mutateAsync({ factId, next })
      if (result.next) {
        pushToast({
          type: 'success',
          message: t('interactions.bookmark_added')
        })
      } else {
        pushToast({
          type: 'success',
          message: t('interactions.bookmark_removed')
        })
      }
    } catch (err) {
      setBookmarkByFactId((prev) => ({ ...prev, [factId]: previous }))
      pushToast({
        type: 'error',
        message: normalizeApiError(err)
      })
    } finally {
      setBookmarkLoadingByFactId((prev) => ({ ...prev, [factId]: false }))
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-800">{t('facts.feed.title')}</h2>
          <div className="group relative">
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label={t('toast.copy_filter_link')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <div className="pointer-events-none absolute right-0 top-11 hidden rounded bg-slate-800 px-2 py-1 text-xs text-white shadow group-hover:block group-focus-within:block">
              {t('toast.copy_filter_link')}
            </div>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {t('facts.feed.subtitle')}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('facts.filter.search_placeholder')}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />

          <select
            name="category_id"
            value={filters.category_id}
            onChange={handleFilterChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">{t('facts.filter.all_categories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="tag_id"
            value={filters.tag_id}
            onChange={handleFilterChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">{t('facts.filter.all_tags')}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          <select
            name="language"
            value={filters.language}
            onChange={handleFilterChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="en">{t('language.en')}</option>
            <option value="vi">{t('language.vi')}</option>
          </select>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-sm font-medium text-slate-700">{t('interactions.bookmark_title')}</p>
          <select
            value={selectedCollectionId}
            onChange={(event) => setSelectedCollectionId(event.target.value)}
            disabled={isLoadingCollections}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-60 md:w-80"
          >
            <option value="">{t('interactions.select_collection')}</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800">{t('facts.random.title')}</h3>
          <button
            type="button"
            onClick={() => {
              setRandomExcludeId(String(randomFact?.id || ''))
              setRandomSeed((prev) => prev + 1)
            }}
            disabled={isLoadingRandom}
            className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isLoadingRandom ? t('common.loading') : t('facts.random.button')}
          </button>
        </div>

        {randomError && (
          <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{randomError}</p>
        )}

        {!randomError && !randomFact && !isLoadingRandom && (
          <p className="mt-3 text-sm text-slate-500">{t('facts.random.empty')}</p>
        )}

        {randomFact && (
          <article className="mt-3 rounded border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-800">{randomFact.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{randomFact.short_fact}</p>
            {randomMeta && (
              <p className="mt-2 text-xs text-slate-500">
                {t('facts.random.cycle_reset')}: {randomMeta.cycle_reset ? t('common.yes') : t('common.no')} | {t('facts.random.remaining_in_cycle')}:{' '}
                {randomMeta.remaining_in_cycle ?? t('common.na')}
              </p>
            )}
            <Link
              to={`/facts/${randomFact.id}`}
              className="mt-2 inline-block text-sm font-medium text-slate-800 underline"
            >
              {t('facts.detail.view')}
            </Link>
          </article>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">{t('facts.title')}</h3>

        {(isLoadingFilters || isLoadingFacts) && (
          <p className="mt-3 text-sm text-slate-600">{t('facts.loading')}</p>
        )}

        {!isLoadingFilters && error && (
          <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>
        )}

        {!isLoadingFilters && !isLoadingFacts && !error && facts.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">
            {t('facts.empty')}
          </p>
        )}

        {!isLoadingFilters && !isLoadingFacts && !error && facts.length > 0 && (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {facts.map((fact) => {
                const factId = String(fact.id)
                return (
                  <FactCard
                    key={factId}
                    fact={fact}
                    categoryMap={categoryMap}
                    tagMap={tagMap}
                    t={t}
                    isFavourited={Boolean(favouriteByFactId[factId])}
                    isBookmarked={Boolean(bookmarkByFactId[factId])}
                    isTogglingFavourite={Boolean(favouriteLoadingByFactId[factId])}
                    isTogglingBookmark={Boolean(bookmarkLoadingByFactId[factId])}
                    onToggleFavourite={handleToggleFavourite}
                    onToggleBookmark={handleToggleBookmark}
                  />
                )
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
              >
                {t('common.prev')}
              </button>
              <p className="text-sm text-slate-600">
                {t('common.page')} {pagination.page} / {pagination.total_pages || 1}
              </p>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= (pagination.total_pages || 1)}
                className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
