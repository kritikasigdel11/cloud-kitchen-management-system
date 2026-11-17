import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Menu.css";

/* =========================
   FOOD IMAGES
========================= */

import bubbleTea from "../assets/project-images/bubble-tea.png";
import chowmein from "../assets/project-images/chowmein.jpg";
import coldCoffee from "../assets/project-images/cold-coffee.jpg";
import cookies from "../assets/project-images/cookies.jpg";
import friedRice from "../assets/project-images/fried-rice.jpg";
import fruitBowl from "../assets/project-images/fruit-bowl.jpg";
import greenSalad from "../assets/project-images/green-salad.jpg";
import lemonade from "../assets/project-images/lemonade.jpg";
import miniBurger from "../assets/project-images/mini-burger.jpg";
import miniCakes from "../assets/project-images/mini-cakes.jpg";
import panPizza from "../assets/project-images/pan-pizza.jpg";
import peachIcedTea from "../assets/project-images/peach-iced-tea.jpg";
import sandwich from "../assets/project-images/sandwich.jpg";
import springRolls from "../assets/project-images/spring-rolls.jpg";
import thupka from "../assets/project-images/thupka.jpg";
import vegBiryani from "../assets/project-images/veg-biryani.jpg";
import vegMomo from "../assets/project-images/veg-momo.jpg";

/* =========================
   IMAGE MAP
========================= */

const imageMap = {
  "bubble-tea.png": bubbleTea,
  "chowmein.jpg": chowmein,
  "cold-coffee.jpg": coldCoffee,
  "cookies.jpg": cookies,
  "fried-rice.jpg": friedRice,
  "fruit-bowl.jpg": fruitBowl,
  "green-salad.jpg": greenSalad,
  "lemonade.jpg": lemonade,
  "mini-burger.jpg": miniBurger,
  "mini-cakes.jpg": miniCakes,
  "pan-pizza.jpg": panPizza,
  "peach-iced-tea.jpg": peachIcedTea,
  "sandwich.jpg": sandwich,
  "spring-rolls.jpg": springRolls,
  "thupka.jpg": thupka,
  "veg-biryani.jpg": vegBiryani,
  "veg-momo.jpg": vegMomo,
};

/* =========================
   DEFAULT FOOD INFORMATION
   Used for description/rating
========================= */

const foodDetails = {
  "Mini Cakes": {
    description: "Soft and delicious mini cakes.",
    rating: 4.8,
  },
  Cookies: {
    description: "Freshly baked crispy cookies.",
    rating: 4.7,
  },
  "Spring Rolls": {
    description: "Crispy vegetable spring rolls.",
    rating: 4.6,
  },
  "Fruit Bowl": {
    description: "Fresh seasonal fruits in a bowl.",
    rating: 4.7,
  },
  "Green Salad": {
    description: "Fresh and healthy green salad.",
    rating: 4.5,
  },
  "Bubble Tea": {
    description: "Refreshing creamy bubble tea.",
    rating: 4.9,
  },
  Sandwich: {
    description: "Fresh sandwich with tasty fillings.",
    rating: 4.6,
  },
  "Pan Pizza": {
    description: "Cheesy pan pizza with fresh toppings.",
    rating: 4.9,
  },
  "Mini Burger": {
    description: "Juicy mini burger with fresh vegetables.",
    rating: 4.8,
  },
  "Veg Momo": {
    description: "Steamed Nepali vegetable dumplings.",
    rating: 4.9,
  },
  "Veg Biryani": {
    description: "Flavorful vegetable biryani.",
    rating: 4.7,
  },
  Thupka: {
    description: "Warm and comforting Nepali noodle soup.",
    rating: 4.8,
  },
  "Peach Iced Tea": {
    description: "Sweet and refreshing peach iced tea.",
    rating: 4.7,
  },
  Lemonade: {
    description: "Fresh homemade lemon drink.",
    rating: 4.6,
  },
  "Fried Rice": {
    description: "Delicious fried rice with vegetables.",
    rating: 4.8,
  },
  "Cold Coffee": {
    description: "Cold and creamy coffee drink.",
    rating: 4.9,
  },
  Chowmein: {
    description: "Tasty stir-fried noodles with vegetables.",
    rating: 4.8,
  },
};

/* =========================
   IMAGE FINDER
========================= */

const getFoodImage = (imagePath, foodName) => {
  if (imagePath) {
    const fileName = imagePath.split("/").pop();

    if (imageMap[fileName]) {
      return imageMap[fileName];
    }
  }

  /* Fallback based on food name */
  const fallbackMap = {
    "Mini Cakes": miniCakes,
    Cookies: cookies,
    "Spring Rolls": springRolls,
    "Fruit Bowl": fruitBowl,
    "Green Salad": greenSalad,
    "Bubble Tea": bubbleTea,
    Sandwich: sandwich,
    "Pan Pizza": panPizza,
    "Mini Burger": miniBurger,
    "Veg Momo": vegMomo,
    "Veg Biryani": vegBiryani,
    Thupka: thupka,
    "Peach Iced Tea": peachIcedTea,
    Lemonade: lemonade,
    "Fried Rice": friedRice,
    "Cold Coffee": coldCoffee,
    Chowmein: chowmein,
  };

  return fallbackMap[foodName];
};

/* =========================
   MENU COMPONENT
========================= */

function Menu() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [menuItems, setMenuItems] = useState([]);

  /* =========================
     CART
  ========================= */

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  /* =========================
     LOAD MENU FROM FLASK BACKEND
  ========================= */

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/menu");

        if (!response.ok) {
          throw new Error("Failed to load menu from backend");
        }

        const savedMenu = await response.json();

        const availableMenu = savedMenu
          .filter((item) => item.is_available !== false)
          .map((item) => ({
            ...item,

            // Use the local food images already in your project
            image: getFoodImage(item.image, item.name),

            // Keep descriptions and ratings from your existing design
            description:
              foodDetails[item.name]?.description ||
              "Freshly prepared and delicious food.",

            rating: foodDetails[item.name]?.rating || 4.8,
          }));

        setMenuItems(availableMenu);
      } catch (error) {
        console.error("Error loading menu:", error);
        setMenuItems([]);
      }
    };

    loadMenu();
  }, []);

  /* =========================
     FILTER FOOD
  ========================= */

  const filteredFoods =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((food) => food.category === selectedCategory);

  /* =========================
     ADD TO CART
  ========================= */

  const addToCart = (food) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.name === food.name);

      if (existingItem) {
        return currentCart.map((item) =>
          item.name === food.name
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...food,
          quantity: 1,
        },
      ];
    });
  };

  /* =========================
     INCREASE QUANTITY
  ========================= */

  const increaseQuantity = (name) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.name === name
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /* =========================
     DECREASE QUANTITY
  ========================= */

  const decreaseQuantity = (name) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.name === name
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* =========================
     REMOVE ITEM
  ========================= */

  const removeFromCart = (name) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.name !== name)
    );
  };

  /* =========================
     CART COUNT
  ========================= */

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  /* =========================
     CART TOTAL
  ========================= */

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  /* =========================
     CATEGORY LIST
  ========================= */

  const categories = [
    { name: "All", icon: "🍽️" },
    { name: "Pizza", icon: "🍕" },
    { name: "Burgers", icon: "🍔" },
    { name: "Nepali", icon: "🥟" },
    { name: "Noodles", icon: "🍜" },
    { name: "Healthy", icon: "🥗" },
    { name: "Drinks", icon: "🧋" },
    { name: "Desserts", icon: "🍰" },
    { name: "Snacks", icon: "🥠" },
    { name: "Rice", icon: "🍚" },
  ];

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="menu-page">
      {/* NAVBAR */}
      <header className="menu-navbar">
        <div className="menu-logo">
          🍽️ <span>Cloud Kitchen</span>
        </div>

        <nav>
          <a href="/">Home</a>
          <a href="/menu" className="active">Menu</a>
          <a href="/recommendations">Recommendations</a>
          <a href="/login">Login</a>

          <button
            className="cart-button"
            onClick={() => setShowCart(true)}
          >
            🛒 Cart <span>{cartCount}</span>
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="menu-hero">
        <div className="menu-hero-content">
          <p className="menu-label">FRESH • TASTY • DELICIOUS</p>
          <h1>
            What are you
            <br />
            <span>craving today?</span>
          </h1>
          <p>
            Explore our delicious selection of freshly prepared food, snacks and refreshing drinks.
          </p>
        </div>

        <div className="hero-stickers">🍕 🍔 🥟 🧋</div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="category-section">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`category ${
              selectedCategory === category.name ? "active-category" : ""
            }`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name !== "All" && category.icon} {category.name}
          </button>
        ))}
      </section>

      {/* MENU CONTENT */}
      <main className="menu-content">
        <div className="menu-heading">
          <div>
            <p>OUR MENU</p>
            <h2>
              {selectedCategory === "All"
                ? "Delicious choices"
                : selectedCategory}
            </h2>
          </div>
          <span>{filteredFoods.length} items</span>
        </div>

        {/* FOOD GRID */}
        {filteredFoods.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#777",
            }}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>🍽️</div>
            <h3>No food available</h3>
            <p>Please check another category.</p>
          </div>
        ) : (
          <div className="food-grid">
            {filteredFoods.map((food) => (
              <div className="food-card-real" key={food.id || food.name}>
                <div className="food-photo">
                  <img src={food.image} alt={food.name} />
                  <button className="heart-button">♡</button>
                </div>

                <div className="food-details">
                  <div className="food-top">
                    <span className="food-category">{food.category}</span>
                    <span className="food-rating">⭐ {food.rating}</span>
                  </div>

                  <h3>{food.name}</h3>
                  <p>{food.description}</p>

                  <div className="food-bottom">
                    <strong>Rs. {food.price}</strong>
                    <button
                      className="add-button"
                      onClick={() => addToCart(food)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="menu-footer">
        <div>
          🍽️ <strong>Cloud Kitchen</strong>
        </div>
        <p>Fresh food. Happy moments. ❤️</p>
        <span>© 2026 Cloud Kitchen Management System</span>
      </footer>

      {/* CART */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <h2>🛒 Your Cart</h2>
              <button
                className="close-cart"
                onClick={() => setShowCart(false)}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some delicious food to your cart.</p>
                <button
                  className="continue-shopping"
                  onClick={() => setShowCart(false)}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.name}>
                      <img src={item.image} alt={item.name} />

                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>Rs. {item.price}</p>

                        <div className="quantity-controls">
                          <button onClick={() => decreaseQuantity(item.name)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.name)}>
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-right">
                        <strong>Rs. {item.price * item.quantity}</strong>
                        <button
                          className="remove-item"
                          onClick={() => removeFromCart(item.name)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CART SUMMARY */}
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Items</span>
                    <span>{cartCount}</span>
                  </div>

                  <div className="summary-row total-row">
                    <strong>Total</strong>
                    <strong>Rs. {cartTotal}</strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={() =>
                      navigate("/checkout", {
                        state: { cart: cart },
                      })
                    }
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;