import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  addFavouriteByFactId,
  checkFavouriteByFactId,
  removeFavouriteByFactId
} from '../../services/favouriteService'
import { queryKeys } from './queryKeys'

export function useFavouritesDomain() {
  const queryClient = useQueryClient()

  const fetchFavouriteStatus = useCallback(
    async ({ factId, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.favouritesCheck(factId),
        queryFn: () => checkFavouriteByFactId(factId, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const addFavouriteAction = useCallback(async ({ factId, errorFallbackMessage = '' }) => {
    return addFavouriteByFactId(factId, { errorFallbackMessage })
  }, [])

  const removeFavouriteAction = useCallback(async ({ factId, errorFallbackMessage = '' }) => {
    return removeFavouriteByFactId(factId, { errorFallbackMessage })
  }, [])

  return {
    fetchFavouriteStatus,
    addFavouriteAction,
    removeFavouriteAction
  }
}
