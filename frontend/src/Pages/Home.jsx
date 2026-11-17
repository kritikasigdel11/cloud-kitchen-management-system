import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">
          🍽️ <span>Cloud Kitchen</span>
        </div>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/recommendations">Recommendations</Link>
          <Link to="/login">
            <button className="login-btn">
              Login
            </button>
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="welcome">WELCOME TO CLOUD KITCHEN</p>
            <h1>
              Delicious Food,
              <br />
              <span>Delivered to You</span>
            </h1>
            <p className="hero-text">
              Order your favorite meals from our cloud kitchen and enjoy delicious food
              delivered right to your doorstep with smart recommendations.
            </p>
            <Link to="/menu">
              <button className="order-btn">
                Explore Menu 🍴
              </button>
            </Link>
          </div>

          <div className="hero-image">
            <div className="food-circle">
              🍜
            </div>
          </div>
        </section>

        {/* POPULAR MENU SECTION */}
        <section className="menu-section">
          <p className="section-label">OUR MENU</p>
          <h2>Popular Foods</h2>

          <div className="food-container">
            <div className="food-card">
              <div className="food-image">🥟</div>
              <h3>Momo</h3>
              <p>Delicious steamed dumplings</p>
              <div className="menu-card-bottom">
                <strong>Rs. 150</strong>
                <Link to="/menu">
                  <button className="add-cart-btn">+ Order</button>
                </Link>
              </div>
            </div>

            <div className="food-card">
              <div className="food-image">🍜</div>
              <h3>Chowmein</h3>
              <p>Fresh and tasty noodles</p>
              <div className="menu-card-bottom">
                <strong>Rs. 180</strong>
                <Link to="/menu">
                  <button className="add-cart-btn">+ Order</button>
                </Link>
              </div>
            </div>

            <div className="food-card">
              <div className="food-image">🍚</div>
              <h3>Fried Rice</h3>
              <p>Flavorful wok-tossed fried rice</p>
              <div className="menu-card-bottom">
                <strong>Rs. 200</strong>
                <Link to="/menu">
                  <button className="add-cart-btn">+ Order</button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SMART RECOMMENDATION PREVIEW */}
        <section className="recommendation-section">
          <p className="section-label">JUST FOR YOU</p>
          <h2>Recommended For You ❤️</h2>
          <p>
            Discover smart food recommendations based on popular pairings,
            cart combinations, and customer preferences.
          </p>
          <Link to="/recommendations">
            <button className="recommend-btn">
              View Recommendations
            </button>
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <p>© 2026 Cloud Kitchen Management System | BIM 6th Semester</p>
      </footer>

    </div>
  );
}

export default Home;