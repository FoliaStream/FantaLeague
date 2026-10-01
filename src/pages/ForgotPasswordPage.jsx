import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            If <strong>{email}</strong> is registered, we've sent a reset link.
            The link expires in 30 minutes.
          </p>
          <p className="auth-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Forgot password</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="primary auth-submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <p className="auth-footer">
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}