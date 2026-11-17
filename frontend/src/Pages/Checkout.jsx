
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
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
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

      // Keep localStorage temporarily for existing Admin/Kitchen pages.
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
        <h2>Cloud Kitchen</h2>
        <button type="button" onClick={() => navigate("/menu")}>
          Back to Menu
        </button>
      </nav>

      <div className="checkout-container">
        <h1>Checkout</h1>
        <p>Complete your delivery details to place your order.</p>

        <form onSubmit={handleSubmit} className="checkout-content">
          <div className="checkout-form">
            <h2>Delivery Information</h2>

            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={customer.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={customer.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />

            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={customer.address}
              onChange={handleChange}
              placeholder="Enter your delivery address"
              required
            />

            <label>City *</label>
            <input
              type="text"
              name="city"
              value={customer.city}
              onChange={handleChange}
              placeholder="Enter your city"
              required
            />

            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={customer.notes}
              onChange={handleChange}
              placeholder="Any special delivery instructions?"
            />

            <h2>Payment Method</h2>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="Cash on Delivery"
                checked={paymentMethod === "Cash on Delivery"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="Online Payment"
                checked={paymentMethod === "Online Payment"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Online Payment
            </label>

            {error && <p className="checkout-error">{error}</p>}

            <button type="submit" disabled={loading || !cart.length}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item, index) => (
                <div className="checkout-item" key={item.id || index}>
                  <span>
                    {item.name} × {item.quantity || 1}
                  </span>
                  <span>
                    Rs.{" "}
                    {Number(item.price || 0) *
                      Number(item.quantity || 1)}
                  </span>
                </div>
              ))
            )}

            <hr />

            <p>
              Subtotal: <strong>Rs. {subtotal}</strong>
            </p>
            <p>
              Delivery Fee: <strong>Rs. {deliveryFee}</strong>
            </p>
            <h3>Total: Rs. {total}</h3>
          </div>
        </form>
      </div>

      <footer className="checkout-footer">
        © {new Date().getFullYear()} Cloud Kitchen Management System
      </footer>
    </div>
  );
}

export default Checkout;
