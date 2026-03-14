import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { useI18n } from '../utils/i18n'
import { isAdmin, isAdminOrEditor } from '../utils/roleAccess'

const navBaseClass = 'rounded px-3 py-2 text-sm font-medium transition-colors'

export default function Header() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useI18n()
  const canModerate = isAdminOrEditor(user)
  const canManageAdmin = isAdmin(user)

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <h1 className="text-lg font-semibold text-slate-800">DidUKnow</h1>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {t('layout.home')}
          </NavLink>
          <NavLink
            to="/facts"
            className={({ isActive }) =>
              `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {t('layout.facts')}
          </NavLink>
          <NavLink
            to="/me/profile"
            className={({ isActive }) =>
              `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {t('layout.me')}
          </NavLink>
          {canModerate ? (
            <>
              <NavLink
                to="/moderation/reports"
                className={({ isActive }) =>
                  `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {t('layout.moderation_reports')}
              </NavLink>
              <NavLink
                to="/moderation/facts"
                className={({ isActive }) =>
                  `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {t('layout.moderation_facts')}
              </NavLink>
              <NavLink
                to="/moderation/fact-performance"
                className={({ isActive }) =>
                  `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {t('layout.fact_performance')}
              </NavLink>
            </>
          ) : null}
          {canManageAdmin ? (
            <>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {t('layout.admin')}
              </NavLink>
              <NavLink
                to="/admin/logs"
                className={({ isActive }) =>
                  `${navBaseClass} ${isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {t('layout.admin_logs')}
              </NavLink>
            </>
          ) : null}
          <span className="ml-2 hidden text-sm text-slate-500 md:inline">
            {user?.username || user?.email || t('layout.user')}
          </span>
          <label className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-slate-600">{t('layout.language')}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 outline-none focus:border-slate-500"
            >
              <option value="en">{t('language.en')}</option>
              <option value="vi">{t('language.vi')}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('layout.logout')}
          </button>
        </nav>
      </div>
    </header>
  )
}
