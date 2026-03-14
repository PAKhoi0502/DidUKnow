import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createComment, deleteComment, getCommentsByFactId, updateComment } from '../../services/commentService'
import { queryKeys } from './queryKeys'

export function useCommentsDomain() {
  const queryClient = useQueryClient()

  const fetchCommentsByFactId = useCallback(
    async ({ factId, params, errorFallbackMessage = '' }) => {
      return queryClient.fetchQuery({
        queryKey: queryKeys.comments(factId, params),
        queryFn: () => getCommentsByFactId(factId, params, { errorFallbackMessage })
      })
    },
    [queryClient]
  )

  const createCommentAction = useCallback(
    async ({ payload, errorFallbackMessage = '' }) => {
      return createComment(payload, { errorFallbackMessage })
    },
    []
  )

  const updateCommentAction = useCallback(
    async ({ commentId, payload, errorFallbackMessage = '' }) => {
      return updateComment(commentId, payload, { errorFallbackMessage })
    },
    []
  )

  const deleteCommentAction = useCallback(
    async ({ commentId, errorFallbackMessage = '' }) => {
      return deleteComment(commentId, { errorFallbackMessage })
    },
    []
  )

  return {
    fetchCommentsByFactId,
    createCommentAction,
    updateCommentAction,
    deleteCommentAction
  }
}
