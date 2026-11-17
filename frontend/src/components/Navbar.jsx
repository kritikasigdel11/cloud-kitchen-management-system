import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">

      <div className="logo">
        🍽️ <span>Cloud Kitchen</span>
      </div>

      <nav>

        <Link to="/">
          Home
        </Link>

        <Link to="/menu">
          Menu
        </Link>

        <Link to="/recommendations">
          Recommendations
        </Link>

        <Link to="/login">
          <button className="login-btn">
            Login
          </button>
        </Link>

      </nav>

    </header>
  )
}

export default Navbar