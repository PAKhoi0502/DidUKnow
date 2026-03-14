import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getCategories } from '../../services/categoryService'
import { getFactById, getFacts, getRandomFact } from '../../services/factService'
import { getTags } from '../../services/tagService'
import { queryKeys } from './queryKeys'

export function useFactsDomain() {
  const queryClient = useQueryClient()

  const fetchCategories = useCallback(
    async ({ language, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.categories(language),
        queryFn: () => getCategories({ lang: language }, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const fetchTags = useCallback(
    async ({ errorFallbackMessage = '' } = {}) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.tags(),
        queryFn: () => getTags({ errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const fetchFacts = useCallback(
    async ({ params, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.facts(params),
        queryFn: () => getFacts(params, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const fetchFactById = useCallback(
    async ({ factId, language, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.factDetail(factId, language),
        queryFn: () => getFactById(factId, { lang: language }, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const fetchRandomFact = useCallback(
    async ({ params, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.randomFact(params),
        queryFn: () => getRandomFact(params, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  return {
    fetchCategories,
    fetchTags,
    fetchFacts,
    fetchFactById,
    fetchRandomFact
  }
}
