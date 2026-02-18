'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  LayoutDashboard, BarChart2, Calendar, FileText, Download, Upload,
  LogOut, User, Search, Moon, Sun, Briefcase, Menu, X
} from 'lucide-react'
import { useAuth } from './lib/AuthContext'
import { useApplications, useAnalytics } from './lib/api'
import { useToast } from './lib/ToastContext'

const KanbanBoard = dynamic(() => import('./components/KanbanBoard'), { ssr: false })
const AnalyticsDashboard = dynamic(() => import('./components/AnalyticsDashboard'), { ssr: false })
const CalendarView = dynamic(() => import('./components/AgendaView'), { ssr: false })
const ResumeParser = dynamic(() => import('./components/ResumeParser'), { ssr: false })
const DataTools = dynamic(() => import('./components/DataTools'), { ssr: false })

type View = 'kanban' | 'analytics' | 'calendar' | 'resume' | 'data'

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'kanban', label: 'Pipeline', icon: <LayoutDashboard size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { id: 'resume', label: 'Resume', icon: <FileText size={18} /> },
  { id: 'data', label: 'Import/Export', icon: <Upload size={18} /> },
]

export default function App() {
  const { user, signOut } = useAuth()
  const { data: apps = [] } = useApplications()
  const { data: analytics } = useAnalytics()
  const { showToast } = useToast()

  const [view, setView] = useState<View>('kanban')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    showToast('Signed out', 'info')
  }

  const stageCount = (id: number) => apps.filter(a => a.stage_id === id).length

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-gray-950' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-white border-r border-gray-200 shadow-xl lg:shadow-none
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Briefcase size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">JobTracker</p>
              <p className="text-xs text-gray-400 mt-0.5">Personal ATS</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-600 mb-2">Quick Stats</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{apps.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{stageCount(4)}</p>
              <p className="text-xs text-gray-500">Offers</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${view === item.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleSignOut} title="Sign out"
              className="text-gray-400 hover:text-red-500 transition flex-shrink-0">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="flex-1 relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {view === 'kanban' && <KanbanBoard search={search} />}
          {view === 'analytics' && <AnalyticsDashboard />}
          {view === 'calendar' && <CalendarView />}
          {view === 'resume' && <ResumeParser />}
          {view === 'data' && <DataTools />}
        </div>
      </main>
    </div>
  )
}