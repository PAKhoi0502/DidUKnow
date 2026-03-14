import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import RoleRoute from './components/RoleRoute'
import HomePage from './pages/HomePage'
import FactsPage from './pages/FactsPage'
import FactDetailPage from './pages/FactDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import ForbiddenPage from './pages/ForbiddenPage'
import ReportModerationPage from './pages/ReportModerationPage'
import ReportDetailPage from './pages/ReportDetailPage'
import FactManagementPage from './pages/FactManagementPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminRolesPage from './pages/AdminRolesPage'
import AdminTaxonomyPage from './pages/AdminTaxonomyPage'
import AdminLogsPage from './pages/AdminLogsPage'
import FactPerformancePage from './pages/FactPerformancePage'
import UserProfilePage from './pages/UserProfilePage'
import MyFavouritesPage from './pages/MyFavouritesPage'
import MyCollectionsPage from './pages/MyCollectionsPage'
import MyCommentsPage from './pages/MyCommentsPage'
import MyReportsPage from './pages/MyReportsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/facts" element={<FactsPage />} />
          <Route path="/facts/:id" element={<FactDetailPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/me/profile" element={<UserProfilePage />} />
          <Route path="/me/favourites" element={<MyFavouritesPage />} />
          <Route path="/me/collections" element={<MyCollectionsPage />} />
          <Route path="/me/comments" element={<MyCommentsPage />} />
          <Route path="/me/reports" element={<MyReportsPage />} />

          <Route element={<RoleRoute allowedRoles={['Admin', 'Editor']} />}>
            <Route path="/moderation/reports" element={<ReportModerationPage />} />
            <Route path="/moderation/reports/:id" element={<ReportDetailPage />} />
            <Route path="/moderation/facts" element={<FactManagementPage />} />
            <Route path="/moderation/fact-performance" element={<FactPerformancePage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/roles" element={<AdminRolesPage />} />
            <Route path="/admin/taxonomy" element={<AdminTaxonomyPage />} />
            <Route path="/admin/logs" element={<AdminLogsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}