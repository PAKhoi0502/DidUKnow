import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createBookmarkCollection, getMyBookmarkCollections } from '../../services/bookmarkCollectionService'
import {
  addFactToCollection,
  getCollectionFacts,
  removeFactFromCollection
} from '../../services/collectionFactService'
import { queryKeys } from './queryKeys'

export function useCollectionsDomain() {
  const queryClient = useQueryClient()

  const fetchCollections = useCallback(
    async ({ params, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.collections(params),
        queryFn: () => getMyBookmarkCollections(params, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const createCollectionAction = useCallback(
    async ({ payload, errorFallbackMessage = '' }) => {
      return createBookmarkCollection(payload, { errorFallbackMessage })
    },
    []
  )

  const fetchCollectionFacts = useCallback(
    async ({ collectionId, params, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.collectionFacts(collectionId, params),
        queryFn: () => getCollectionFacts(collectionId, params, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const addFactToCollectionAction = useCallback(
    async ({ payload, errorFallbackMessage = '' }) => {
      return addFactToCollection(payload, { errorFallbackMessage })
    },
    []
  )

  const removeFactFromCollectionAction = useCallback(
    async ({ collectionId, factId, errorFallbackMessage = '' }) => {
      return removeFactFromCollection(collectionId, factId, { errorFallbackMessage })
    },
    []
  )

  return {
    fetchCollections,
    createCollectionAction,
    fetchCollectionFacts,
    addFactToCollectionAction,
    removeFactFromCollectionAction
  }
}
