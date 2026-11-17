
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cart || [];

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const deliveryFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim() ||
      !customer.city.trim()
    ) {
      setError("Please fill in all required delivery details.");
      return;
    }

    const orderId = "CK" + Math.floor(100000 + Math.random() * 900000);

    const order = {
      id: orderId,
      orderId,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      notes: customer.notes,
      customer: {
        name: customer.name,
        phone: customer.phone,
      },
      items: cart,
      cart,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not place your order.");
      }

      const existingOrders = JSON.parse(
        localStorage.getItem("cloudKitchenOrders") || "[]"
      );

      existingOrders.push(order);

      localStorage.setItem(
        "cloudKitchenOrders",
        JSON.stringify(existingOrders)
      );

      navigate("/order-success", {
        state: { order },
      });
    } catch (err) {
      console.error("Order error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <nav className="checkout-navbar">
        <div className="checkout-brand">
          <span className="brand-icon">🍽️</span>
          <span>Cloud Kitchen</span>
        </div>

        <button
          type="button"
          className="back-menu-btn"
          onClick={() => navigate("/menu")}
        >
          ← Back to Menu
        </button>
      </nav>

      <main className="checkout-container">
        <div className="checkout-heading">
          <span className="checkout-eyebrow">ALMOST THERE!</span>
          <h1>Complete Your Order</h1>
          <p>Just a few details and your delicious food will be on its way.</p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-checkout">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious food before proceeding to checkout.</p>
            <button onClick={() => navigate("/menu")}>
              Explore Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-content">
            <div className="checkout-left">
              <section className="checkout-card">
                <div className="section-heading">
                  <span className="section-icon">📍</span>
                  <div>
                    <h2>Delivery Information</h2>
                    <p>Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="checkout-fields">
                  <div className="checkout-field">
                    <label htmlFor="customer-name">Full Name *</label>
                    <input
                      id="customer-name"
                      type="text"
                      name="name"
                      value={customer.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="customer-phone">Phone Number *</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      name="phone"
                      value={customer.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="checkout-field full-field">
                    <label htmlFor="customer-address">Delivery Address *</label>
                    <input
                      id="customer-address"
                      type="text"
                      name="address"
                      value={customer.address}
                      onChange={handleChange}
                      placeholder="House number, street, area..."
                      required
                    />
                  </div>

                  <div className="checkout-field full-field">
                    <label htmlFor="customer-city">City *</label>
                    <input
                      id="customer-city"
                      type="text"
                      name="city"
                      value={customer.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                      required
                    />
                  </div>

                  <div className="checkout-field full-field">
                    <label htmlFor="customer-notes">
                      Additional Notes <span>(Optional)</span>
                    </label>
                    <textarea
                      id="customer-notes"
                      name="notes"
                      value={customer.notes}
                      onChange={handleChange}
                      placeholder="Any special delivery instructions?"
                      rows="3"
                    />
                  </div>
                </div>
              </section>

              <section className="checkout-card payment-card">
                <div className="section-heading">
                  <span className="section-icon">💳</span>
                  <div>
                    <h2>Payment Method</h2>
                    <p>Choose how you would like to pay.</p>
                  </div>
                </div>

                <div className="payment-options">
                  <label
                    className={`payment-option ${
                      paymentMethod === "Cash on Delivery" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === "Cash on Delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-emoji">💵</span>
                    <span className="payment-text">
                      <strong>Cash on Delivery</strong>
                      <small>Pay when your food arrives</small>
                    </span>
                  </label>

                  <label
                    className={`payment-option ${
                      paymentMethod === "Online Payment" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Online Payment"
                      checked={paymentMethod === "Online Payment"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-emoji">📱</span>
                    <span className="payment-text">
                      <strong>Online Payment</strong>
                      <small>Online payment option</small>
                    </span>
                  </label>
                </div>
              </section>

              {error && (
                <div className="checkout-error">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            <aside className="checkout-summary">
              <div className="summary-heading">
                <h2>Order Summary</h2>
                <span>{cart.length} {cart.length === 1 ? "item" : "items"}</span>
              </div>

              <div className="summary-items">
                {cart.map((item, index) => (
                  <div className="checkout-item" key={item.id || index}>
                    <div className="summary-item-info">
                      <span className="item-quantity">
                        {item.quantity || 1}x
                      </span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <strong>
                      Rs. {Number(item.price || 0) * Number(item.quantity || 1)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-price-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>

              <div className="summary-price-row">
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total Amount</span>
                <strong>Rs. {total}</strong>
              </div>

              <button
                type="submit"
                className="place-order-btn"
                disabled={loading || !cart.length}
              >
                {loading ? "Placing Your Order..." : "Place Order →"}
              </button>

              <div className="checkout-security">
                <span>🔒</span>
                Your order details are submitted securely.
              </div>

              <div className="delivery-note">
                <span>🚚</span>
                <p>Delivery fee is Rs. 50 for your order.</p>
              </div>
            </aside>
          </form>
        )}
      </main>

      <footer className="checkout-footer">
        <p>© {new Date().getFullYear()} Cloud Kitchen Management System</p>
        <span>Made with ❤️ for food lovers</span>
      </footer>
    </div>
  );
}

export default Checkout;
