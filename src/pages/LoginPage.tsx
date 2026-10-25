import { useState } from 'react'
import { authAvailable, login } from '../services/auth'
import { useShopStore } from '../store/useShopStore'
import { useSessionStore } from '../store/useSessionStore'
import type { UserRole } from '../types/models'

export function LoginPage() {
  const [role, setRole] = useState<UserRole>('reception')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const settings = useShopStore((state) => state.settings)
  const loginLocal = useSessionStore((state) => state.loginLocal)

  const submit = async () => {
    setError('')
    if (authAvailable) {
      await login(username, password).catch((reason) => setError(reason.message))
      return
    }
    const expected = settings.localUsers[role]
    if (username === expected.username && password === expected.password) {
      loginLocal(role, username)
      return
    }
    setError('Wrong username or password.')
  }

  return (
    <main className="login-shell">
      <section className="card stack login-card">
        <div><p className="eyebrow">Shop access</p><h2>Sign in</h2></div>
        {!authAvailable && (
          <label>
            Login as
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="reception">Reception</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <label>{authAvailable ? 'Email' : 'Username'}<input value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p className="error-text">{error}</p>}
        <button className="button primary" onClick={submit}>
          Login
        </button>
      </section>
    </main>
  )
}
