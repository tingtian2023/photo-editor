import { useState } from 'react'
import { checkToken } from '../lib/api'
import { getServerUrl, saveAuth } from '../lib/auth'

export default function AccessCodeScreen({ onUnlocked }: { onUnlocked: () => void }) {
  const [server, setServer] = useState(getServerUrl())
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    const serverUrl = server.trim()
    if (!trimmed || !serverUrl || busy) return
    setBusy(true)
    setError('')
    const result = await checkToken(trimmed, serverUrl)
    setBusy(false)
    if (result === 'ok') {
      saveAuth(trimmed, serverUrl)
      onUnlocked()
    } else if (result === 'invalid') {
      setError('That access code is not valid.')
    } else {
      setError('Cannot reach the server. Check the server URL and your connection.')
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-base-200 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm bg-base-100 shadow-md">
        <div className="card-body">
          <h1 className="card-title text-2xl text-primary">Photo Editor</h1>
          <p className="text-base-content/70">Enter your server URL and access code to continue.</p>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Server URL</legend>
            <input
              className="input w-full"
              type="url"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="https://example.trycloudflare.com"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Access code</legend>
            <input
              className="input w-full"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Access code"
              autoComplete="current-password"
            />
          </fieldset>
          {error && <p className="text-sm text-error">{error}</p>}
          <button type="submit" className="btn btn-primary mt-2" disabled={!code.trim() || !server.trim() || busy}>
            {busy && <span className="loading loading-spinner" />}
            Unlock
          </button>
        </div>
      </form>
    </div>
  )
}
