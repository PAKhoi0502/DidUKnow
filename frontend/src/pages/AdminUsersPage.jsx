import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'
import {
  deleteUserById,
  getUsers,
  updateUserById,
  updateUserRoleById
} from '../services/userAdminService'
import { getRoles } from '../services/roleService'

const EMPTY_EDIT_FORM = {
  username: '',
  email: '',
  avatar_url: '',
  language: 'en',
  status: 'active',
  password: ''
}

export default function AdminUsersPage() {
  const { t } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editingUserId, setEditingUserId] = useState('')
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
  const [roleDraftByUserId, setRoleDraftByUserId] = useState({})

  const usersQuery = useQuery({
    queryKey: ['admin-users', search, statusFilter, roleFilter, page, limit],
    queryFn: () =>
      getUsers(
        {
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          role_id: roleFilter || undefined,
          page,
          limit
        },
        {
          errorFallbackMessage: t('admin.users.load_failed')
        }
      )
  })

  const rolesQuery = useQuery({
    queryKey: ['admin-roles-options'],
    queryFn: () => getRoles({ errorFallbackMessage: t('admin.users.load_failed') })
  })

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, payload }) =>
      updateUserById(userId, payload, { errorFallbackMessage: t('admin.users.update_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.users.update_success') })
      setEditingUserId('')
      setEditForm(EMPTY_EDIT_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.users.update_failed') })
    }
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, payload }) =>
      updateUserRoleById(userId, payload, { errorFallbackMessage: t('admin.users.role_update_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.users.role_update_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.users.role_update_failed') })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUserById(userId, { errorFallbackMessage: t('admin.users.delete_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.users.delete_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.users.delete_failed') })
    }
  })

  const users = usersQuery.data?.items ?? []
  const usersPagination = usersQuery.data?.pagination
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data])
  const roleNameById = useMemo(
    () =>
      Object.fromEntries(
        roles.map((role) => [String(role.id), role.name])
      ),
    [roles]
  )

  const totalPages = Math.max(1, usersPagination?.total_pages ?? 1)
  const normalizedPage = usersPagination?.page ?? page

  const beginEdit = (user) => {
    setEditingUserId(String(user.id))
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      avatar_url: user.avatar_url || '',
      language: user.language || 'en',
      status: user.status || 'active',
      password: ''
    })
  }

  const submitEdit = (userId) => {
    const payload = {
      username: editForm.username.trim(),
      email: editForm.email.trim(),
      avatar_url: editForm.avatar_url.trim() || null,
      language: editForm.language,
      status: editForm.status
    }

    if (editForm.password.trim()) {
      payload.password = editForm.password.trim()
    }

    updateProfileMutation.mutate({ userId, payload })
  }

  const submitRoleChange = (user) => {
    const userId = String(user.id)
    const draft = roleDraftByUserId[userId] ?? {
      role_id: String(user.role_id),
      reason: ''
    }

    if (!draft.role_id) {
      pushToast({ type: 'error', message: t('admin.users.role_required') })
      return
    }

    updateRoleMutation.mutate({
      userId,
      payload: {
        role_id: draft.role_id,
        reason: draft.reason.trim() || undefined
      }
    })
  }

  const submitDelete = (user) => {
    const confirmed = window.confirm(
      t('admin.users.delete_confirm', 'Are you sure to delete this user?')
    )

    if (!confirmed) {
      return
    }

    deleteMutation.mutate(String(user.id))
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.users.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.users.subtitle')}</p>
      </header>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-slate-700 md:col-span-2">
          {t('admin.users.search')}
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder={t('admin.users.search_placeholder')}
          />
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.users.filter_status')}
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.users.all_statuses')}</option>
            <option value="active">{t('admin.users.status.active')}</option>
            <option value="inactive">{t('admin.users.status.inactive')}</option>
            <option value="banned">{t('admin.users.status.banned')}</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.users.filter_role')}
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.users.all_roles')}</option>
            {roles.map((role) => (
              <option key={role.id} value={String(role.id)}>
                {role.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {usersQuery.isLoading ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {usersQuery.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {usersQuery.error?.message || t('admin.users.load_failed')}
        </p>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.error && users.length === 0 ? (
        <p className="rounded-lg bg-white p-4 text-sm text-slate-600">{t('admin.users.empty')}</p>
      ) : null}

      {users.map((user) => {
        const userId = String(user.id)
        const roleDraft = roleDraftByUserId[userId] ?? {
          role_id: String(user.role_id || ''),
          reason: ''
        }
        const isEditing = editingUserId === userId

        return (
          <article key={userId} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p>
                <span className="font-medium text-slate-700">{t('admin.users.username')}:</span> {user.username}
              </p>
              <p>
                <span className="font-medium text-slate-700">{t('admin.users.email')}:</span> {user.email}
              </p>
              <p>
                <span className="font-medium text-slate-700">{t('admin.users.role')}:</span>{' '}
                {user.role_name || roleNameById[String(user.role_id)] || String(user.role_id)}
              </p>
              <p>
                <span className="font-medium text-slate-700">{t('admin.users.user_status')}:</span>{' '}
                {t(`admin.users.status.${user.status}`)}
              </p>
            </div>

            {isEditing ? (
              <div className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
                <label className="text-sm text-slate-700">
                  {t('admin.users.username')}
                  <input
                    value={editForm.username}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, username: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  {t('admin.users.email')}
                  <input
                    value={editForm.email}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  {t('admin.users.avatar_url')}
                  <input
                    value={editForm.avatar_url}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, avatar_url: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  {t('admin.users.password_optional')}
                  <input
                    value={editForm.password}
                    type="password"
                    onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  {t('admin.users.language')}
                  <select
                    value={editForm.language}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, language: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="en">{t('language.en')}</option>
                    <option value="vi">{t('language.vi')}</option>
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  {t('admin.users.user_status')}
                  <select
                    value={editForm.status}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  >
                    <option value="active">{t('admin.users.status.active')}</option>
                    <option value="inactive">{t('admin.users.status.inactive')}</option>
                    <option value="banned">{t('admin.users.status.banned')}</option>
                  </select>
                </label>

                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => submitEdit(userId)}
                    disabled={updateProfileMutation.isPending}
                    className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    {t('admin.users.save_profile')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserId('')
                      setEditForm(EMPTY_EDIT_FORM)
                    }}
                    className="rounded border border-slate-300 px-3 py-2 text-sm"
                  >
                    {t('comments.cancel')}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-2 md:grid-cols-[1fr,1fr,auto,auto]">
              <select
                value={roleDraft.role_id}
                onChange={(event) =>
                  setRoleDraftByUserId((prev) => ({
                    ...prev,
                    [userId]: { ...roleDraft, role_id: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t('admin.users.select_role')}</option>
                {roles.map((role) => (
                  <option key={role.id} value={String(role.id)}>
                    {role.name}
                  </option>
                ))}
              </select>

              <input
                value={roleDraft.reason}
                onChange={(event) =>
                  setRoleDraftByUserId((prev) => ({
                    ...prev,
                    [userId]: { ...roleDraft, reason: event.target.value }
                  }))
                }
                placeholder={t('admin.users.role_reason_optional')}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => submitRoleChange(user)}
                disabled={updateRoleMutation.isPending}
                className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                {t('admin.users.change_role')}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => beginEdit(user)}
                  className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                >
                  {t('admin.users.edit_profile')}
                </button>
                <button
                  type="button"
                  onClick={() => submitDelete(user)}
                  disabled={deleteMutation.isPending}
                  className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  {t('admin.users.delete_user')}
                </button>
              </div>
            </div>
          </article>
        )
      })}

      <div className="flex items-center justify-end gap-2">
        <select
          value={limit}
          onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <button
          type="button"
          disabled={normalizedPage <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          {t('common.prev')}
        </button>
        <span className="text-sm text-slate-600">
          {t('facts.page_info').replace('{page}', String(normalizedPage)).replace('{total_pages}', String(totalPages))}
        </span>
        <button
          type="button"
          disabled={normalizedPage >= totalPages}
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          {t('common.next')}
        </button>
      </div>
    </section>
  )
}
