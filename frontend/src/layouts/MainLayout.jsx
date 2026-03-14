import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
