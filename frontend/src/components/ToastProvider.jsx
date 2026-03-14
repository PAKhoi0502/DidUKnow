import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from '../hooks/toastContext'
import { useI18n } from '../utils/i18n'

const DEFAULT_DURATION_MS = 2200

function getToastClasses(type) {
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }

  if (type === 'error') {
    return 'border-red-200 bg-red-50 text-red-800'
  }

  return 'border-slate-200 bg-white text-slate-800'
}

export default function ToastProvider({ children }) {
  const { t } = useI18n()
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    ({ message, type = 'info', durationMs = DEFAULT_DURATION_MS }) => {
      const id = crypto.randomUUID()

      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        dismissToast(id)
      }, durationMs)
    },
    [dismissToast]
  )

  const value = useMemo(
    () => ({
      pushToast
    }),
    [pushToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow ${getToastClasses(toast.type)}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <p>{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-xs font-semibold opacity-70 hover:opacity-100"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
