
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Login failed. Please try again.')
        return
      }

      // Save login information
      const storage = rememberMe ? localStorage : sessionStorage

      storage.setItem('access_token', data.access_token)
      storage.setItem('user', JSON.stringify(data.user))

      alert('Welcome back, ' + data.user.name + '!')

      // Redirect according to user role
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'kitchen_staff') {
        navigate('/kitchen')
      } else if (data.user.role === 'delivery_driver') {
        navigate('/delivery')
      } else {
        navigate('/')
      }

    } catch (error) {
      console.error('Login error:', error)
      alert('Cannot connect to the server. Please check your backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="login-brand">
          🍽️
          <span>Cloud Kitchen</span>
        </div>

        <div className="login-welcome">
          <span className="login-small-title">
            WELCOME BACK
          </span>

          <h1>
            Delicious food
            <br />
            is waiting for you.
          </h1>

          <p>
            Sign in to order your favorite meals,
            track your orders and discover delicious
            recommendations.
          </p>

          <div className="login-food-display">
            <span>🍕</span>
            <span>🍔</span>
            <span>🥟</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-box">

          <div className="login-heading">
            <h2>
              Welcome Back 👋
            </h2>

            <p>
              Sign in to your Cloud Kitchen account
            </p>
          </div>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">
              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <div className="password-label">
                <label>
                  Password
                </label>

                <a href="#forgot">
                  Forgot Password?
                </a>
              </div>

              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <div className="remember-row">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          {/* REGISTER */}
          <div className="register-link">
            Don't have an account?
            <Link to="/register">
              Create Account
            </Link>
          </div>

          {/* BACK */}
          <Link
            to="/"
            className="back-home"
          >
            ← Back to Home
          </Link>

        </div>
      </div>

    </div>
  )
}

export default Login
