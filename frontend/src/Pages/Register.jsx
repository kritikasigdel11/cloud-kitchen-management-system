
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    if (password.length < 8) {
      alert('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        'http://127.0.0.1:5000/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Registration failed.')
        return
      }

      // Save the newly registered user
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      alert('Account created successfully! Welcome, ' + data.user.name + '!')

      navigate('/')

    } catch (error) {
      console.error('Registration error:', error)
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
            JOIN US TODAY
          </span>

          <h1>
            Good food,
            <br />
            great moments.
          </h1>

          <p>
            Create your account to order delicious meals,
            discover new favorites and enjoy your
            Cloud Kitchen experience.
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
            <h2>Create Account ✨</h2>
            <p>Join Cloud Kitchen and enjoy delicious food</p>
          </div>

          <form onSubmit={handleRegister}>

            {/* NAME */}
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email Address</label>

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
              <label>Password</label>

              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password (minimum 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
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

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="register-link">
            Already have an account?
            <Link to="/login">
              Sign In
            </Link>
          </div>

          {/* HOME LINK */}
          <Link to="/" className="back-home">
            ← Back to Home
          </Link>

        </div>
      </div>

    </div>
  )
}

export default Register
