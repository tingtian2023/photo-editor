import { useEffect, useState } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { FEATURES } from './features'
import { clearToken, hasToken, onTokenCleared } from './lib/auth'
import AccessCodeScreen from './screens/AccessCodeScreen'
import HomeScreen from './screens/HomeScreen'

// HashRouter (#/crop) so GitHub Pages never needs a server-side route.
export default function App() {
  const [unlocked, setUnlocked] = useState(hasToken())
  useEffect(() => onTokenCleared(() => setUnlocked(false)), [])

  if (!unlocked) return <AccessCodeScreen onUnlocked={() => setUnlocked(true)} />

  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}

function Shell() {
  const { pathname } = useLocation()
  const feature = FEATURES.find((f) => `/${f.path}` === pathname)
  const title = feature ? (feature.title ?? feature.label) : 'Photo Editor'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-dvh bg-base-200">
      <header className="navbar sticky top-0 z-10 bg-primary text-primary-content shadow-md">
        <div className="navbar-start w-auto">
          {feature && (
            <Link to="/" className="btn btn-ghost btn-square text-primary-content" aria-label="Back">
              <ArrowLeft className="size-5" />
            </Link>
          )}
        </div>
        <h1 className="flex-1 truncate px-2 text-lg font-bold">{title}</h1>
        <div className="navbar-end w-auto">
          {!feature && (
            <button type="button" className="btn btn-ghost btn-square text-primary-content" onClick={clearToken} aria-label="Lock app and change server">
              <LogOut className="size-5" />
            </button>
          )}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          {FEATURES.map((f) => (
            <Route key={f.path} path={`/${f.path}`} element={<f.Screen />} />
          ))}
          <Route path="*" element={<HomeScreen />} />
        </Routes>
      </main>
    </div>
  )
}
