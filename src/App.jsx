import { useState } from 'react'
import LoadingScreen from './pages/LoadingScreen.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tracker from './pages/Tracker.jsx'
import Journal from './pages/Journal.jsx'
import ProDashboard from './pages/ProDashboard.jsx'
import './App.css'

const PAGES = [
  { id: 'loading', label: 'Loading', component: LoadingScreen },
  { id: 'dashboard', label: 'Dashboard', component: Dashboard },
  { id: 'tracker', label: 'Tracker', component: Tracker },
  { id: 'journal', label: 'Journal', component: Journal },
  { id: 'pro', label: 'Pro', component: ProDashboard },
]

function App() {
  const [activePage, setActivePage] = useState('loading')

  const ActiveComponent =
    PAGES.find((page) => page.id === activePage)?.component ?? LoadingScreen

  return (
    <div className="app">
      {/* Updated Navigation Bar with Tailwind button styling */}
      <nav className="flex items-center gap-2 p-4 bg-zinc-950 border-b border-zinc-800" aria-label="Main navigation">
        {PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 border rounded-sm ${
              activePage === page.id 
                ? 'bg-red-600 text-white border-red-500' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`}
            onClick={() => setActivePage(page.id)}
          >
            {page.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activePage === 'loading' ? (
          <LoadingScreen onInitialize={() => setActivePage('dashboard')} />
        ) : activePage === 'dashboard' ? (
          <Dashboard onNavigate={setActivePage} />
        ) : (
          <ActiveComponent />
        )}
      </main>
    </div>
  )
}

export default App