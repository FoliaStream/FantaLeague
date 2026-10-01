import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api/client'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/'
  const flashMessage = location.state?.message

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Welcome back to FantaLeague.</p>

        {flashMessage && (
          <p className="auth-success">{flashMessage}</p>
        )}

        <label className="auth-field">
          <span>Username</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="auth-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="primary auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  )
}