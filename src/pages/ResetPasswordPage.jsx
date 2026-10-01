import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/client'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title">Invalid link</h1>
          <p className="auth-subtitle">
            This password reset link is missing its token.
          </p>
          <p className="auth-footer">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. You can now sign in.' },
      })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Set a new password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>

        <label className="auth-field">
          <span>New password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <small className="auth-hint">At least 8 characters</small>
        </label>

        <label className="auth-field">
          <span>Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="primary auth-submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </form>
    </div>
  )
}