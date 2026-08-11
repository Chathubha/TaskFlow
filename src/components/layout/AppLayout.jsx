import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

// Shared shell: dark sidebar + top navbar + scrollable content area.
// On small screens the sidebar becomes an off-canvas drawer toggled by the
// hamburger button in the navbar.
export default function AppLayout() {
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close the drawer whenever the route changes (e.g. after tapping a nav item).
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar currentPath={pathname} onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
