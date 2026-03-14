import { useCallback } from 'react'
import { createReportFact } from '../../services/reportFactService'

export function useReportsDomain() {
  const createReportAction = useCallback(async ({ payload, errorFallbackMessage = '' }) => {
    return createReportFact(payload, { errorFallbackMessage })
  }, [])

  return {
    createReportAction
  }
}
