import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="success-empty">
        <div className="success-empty-card">
          <div className="empty-icon">📦</div>

          <h2>No order found</h2>

          <p>
            We couldn't find your order information.
          </p>

          <button onClick={() => navigate("/menu")}>
            Browse Menu →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-page">

      {/* NAVBAR */}
      <header className="success-navbar">

        <div
          className="success-logo"
          onClick={() => navigate("/")}
        >
          🍽️ <span>Cloud Kitchen</span>
        </div>

        <button
          className="success-home-btn"
          onClick={() => navigate("/")}
        >
          Home
        </button>

      </header>

      {/* SUCCESS SECTION */}
      <main className="success-container">

        <div className="success-icon">
          ✓
        </div>

        <h1>Order Confirmed!</h1>

        <p className="success-message">
          Thank you, <strong>{order.customer.name}</strong>!
          <br />
          Your delicious food is being prepared.
        </p>

        {/* ORDER ID */}
        <div className="order-id-box">
          <span>Order ID</span>
          <strong>{order.orderId}</strong>
        </div>

        {/* MAIN CONTENT */}
        <div className="success-content">

          {/* ORDER DETAILS */}
          <section className="success-card">

            <h2>📦 Order Details</h2>

            <div className="detail-row">
              <span>Customer</span>
              <strong>{order.customer.name}</strong>
            </div>

            <div className="detail-row">
              <span>Phone</span>
              <strong>{order.customer.phone}</strong>
            </div>

            <div className="detail-row">
              <span>Delivery Address</span>
              <strong>
                {order.customer.address}, {order.customer.city}
              </strong>
            </div>

            <div className="detail-row">
              <span>Payment</span>
              <strong>{order.paymentMethod}</strong>
            </div>

          </section>

          {/* ORDER SUMMARY */}
          <section className="success-card">

            <h2>🍴 Your Order</h2>

            <div className="ordered-items">

              {order.cart.map((item) => (
                <div
                  className="ordered-item"
                  key={item.name}
                >

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="ordered-item-info">

                    <h3>{item.name}</h3>

                    <p>
                      {item.quantity} × Rs. {item.price}
                    </p>

                  </div>

                  <strong>
                    Rs. {item.price * item.quantity}
                  </strong>

                </div>
              ))}

            </div>

            <div className="success-total">

              <span>Total Paid</span>

              <strong>
                Rs. {order.total}
              </strong>

            </div>

          </section>

        </div>

        {/* DELIVERY INFORMATION */}
        <div className="delivery-box">

          <div className="delivery-icon">
            🛵
          </div>

          <div>
            <h3>Estimated Delivery</h3>

            <p>
              Your order should arrive in approximately
              <strong> 30–45 minutes</strong>.
            </p>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="success-buttons">

          <button
            className="primary-success-btn"
            onClick={() => navigate("/menu")}
          >
            🍔 Order More Food
          </button>

          <button
            className="secondary-success-btn"
            onClick={() => navigate("/")}
          >
            🏠 Back to Home
          </button>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="success-footer">
        <p>
          © 2026 Cloud Kitchen. Made with ❤️ for food lovers.
        </p>
      </footer>

    </div>
  );
}

export default OrderSuccess;