import { NavLink } from 'react-router-dom'
import { useI18n } from '../utils/i18n'
import { useAuth } from '../hooks/authContext'
import { isAdmin, isAdminOrEditor } from '../utils/roleAccess'

const linkClass = ({ isActive }) =>
  `block rounded px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
  }`

export default function Sidebar() {
  const { t } = useI18n()
  const { user } = useAuth()
  const canModerate = isAdminOrEditor(user)
  const canManageAdmin = isAdmin(user)

  return (
    <aside className="w-full border-r border-slate-200 bg-white p-4 md:w-60">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t('layout.navigation')}
      </p>
      <nav className="space-y-1">
        <NavLink to="/home" className={linkClass}>
          {t('layout.home')}
        </NavLink>
        <NavLink to="/facts" className={linkClass}>
          {t('layout.facts')}
        </NavLink>
        <NavLink to="/me/profile" className={linkClass}>
          {t('layout.my_profile')}
        </NavLink>
        <NavLink to="/me/favourites" className={linkClass}>
          {t('layout.my_favourites')}
        </NavLink>
        <NavLink to="/me/collections" className={linkClass}>
          {t('layout.my_collections')}
        </NavLink>
        <NavLink to="/me/comments" className={linkClass}>
          {t('layout.my_comments')}
        </NavLink>
        <NavLink to="/me/reports" className={linkClass}>
          {t('layout.my_reports')}
        </NavLink>
        {canModerate ? (
          <>
            <NavLink to="/moderation/reports" className={linkClass}>
              {t('layout.moderation_reports')}
            </NavLink>
            <NavLink to="/moderation/facts" className={linkClass}>
              {t('layout.moderation_facts')}
            </NavLink>
            <NavLink to="/moderation/fact-performance" className={linkClass}>
              {t('layout.fact_performance')}
            </NavLink>
          </>
        ) : null}
        {canManageAdmin ? (
          <>
            <NavLink to="/admin/users" className={linkClass}>
              {t('layout.admin_users')}
            </NavLink>
            <NavLink to="/admin/roles" className={linkClass}>
              {t('layout.admin_roles')}
            </NavLink>
            <NavLink to="/admin/taxonomy" className={linkClass}>
              {t('layout.admin_taxonomy')}
            </NavLink>
            <NavLink to="/admin/logs" className={linkClass}>
              {t('layout.admin_logs')}
            </NavLink>
          </>
        ) : null}
      </nav>
    </aside>
  )
}
