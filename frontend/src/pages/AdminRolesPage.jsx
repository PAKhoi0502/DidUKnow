import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'
import { createRole, deleteRoleById, getRoles, updateRoleById } from '../services/roleService'

const EMPTY_CREATE_FORM = {
  name: '',
  description: '',
  status: 'active'
}

export default function AdminRolesPage() {
  const { t } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM)
  const [editDraftById, setEditDraftById] = useState({})

  const rolesQuery = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => getRoles({ errorFallbackMessage: t('admin.roles.load_failed') })
  })

  const createMutation = useMutation({
    mutationFn: (payload) => createRole(payload, { errorFallbackMessage: t('admin.roles.create_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.roles.create_success') })
      setCreateForm(EMPTY_CREATE_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.roles.create_failed') })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ roleId, payload }) =>
      updateRoleById(roleId, payload, { errorFallbackMessage: t('admin.roles.update_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.roles.update_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.roles.update_failed') })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (roleId) => deleteRoleById(roleId, { errorFallbackMessage: t('admin.roles.delete_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.roles.delete_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.roles.delete_failed') })
    }
  })

  const roles = rolesQuery.data ?? []

  const submitCreate = (event) => {
    event.preventDefault()
    createMutation.mutate({
      name: createForm.name.trim(),
      description: createForm.description.trim() || null,
      status: createForm.status
    })
  }

  const submitUpdate = (role) => {
    const roleId = String(role.id)
    const draft = editDraftById[roleId] ?? {
      name: role.name,
      description: role.description || '',
      status: role.status
    }

    updateMutation.mutate({
      roleId,
      payload: {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        status: draft.status
      }
    })
  }

  const submitDelete = (role) => {
    const confirmed = window.confirm(
      t('admin.roles.delete_confirm', 'Are you sure to delete this role?')
    )
    if (!confirmed) {
      return
    }

    deleteMutation.mutate(String(role.id))
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.roles.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.roles.subtitle')}</p>
      </header>

      <form onSubmit={submitCreate} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-slate-700">
          {t('admin.roles.name')}
          <input
            required
            value={createForm.name}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          {t('admin.roles.description')}
          <input
            value={createForm.description}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-700">
          {t('admin.roles.status')}
          <select
            value={createForm.status}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, status: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="active">{t('admin.roles.status.active')}</option>
            <option value="inactive">{t('admin.roles.status.inactive')}</option>
          </select>
        </label>
        <div className="md:col-span-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {t('admin.roles.create_button')}
          </button>
        </div>
      </form>

      {rolesQuery.isLoading ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {rolesQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {rolesQuery.error?.message || t('admin.roles.load_failed')}
        </p>
      ) : null}

      {roles.map((role) => {
        const roleId = String(role.id)
        const draft = editDraftById[roleId] ?? {
          name: role.name,
          description: role.description || '',
          status: role.status
        }

        return (
          <article key={roleId} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr,2fr,160px,auto]">
            <input
              value={draft.name}
              onChange={(event) =>
                setEditDraftById((prev) => ({
                  ...prev,
                  [roleId]: { ...draft, name: event.target.value }
                }))
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={draft.description}
              onChange={(event) =>
                setEditDraftById((prev) => ({
                  ...prev,
                  [roleId]: { ...draft, description: event.target.value }
                }))
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={draft.status}
              onChange={(event) =>
                setEditDraftById((prev) => ({
                  ...prev,
                  [roleId]: { ...draft, status: event.target.value }
                }))
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="active">{t('admin.roles.status.active')}</option>
              <option value="inactive">{t('admin.roles.status.inactive')}</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => submitUpdate(role)}
                disabled={updateMutation.isPending}
                className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                {t('admin.roles.save_button')}
              </button>
              <button
                type="button"
                onClick={() => submitDelete(role)}
                disabled={deleteMutation.isPending}
                className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                {t('admin.roles.delete_button')}
              </button>
            </div>
          </article>
        )
      })}
    </section>
  )
}
