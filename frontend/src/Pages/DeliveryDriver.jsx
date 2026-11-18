import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DeliveryDriver.css";

const API_URL = "http://127.0.0.1:5000/api/orders";

function DeliveryDriver() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [newDeliveryAlert, setNewDeliveryAlert] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const previousDeliveryCount = useRef(null);

  // GET AUTHENTICATION TOKEN
  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  // AUTHENTICATION HEADERS
  const getAuthHeaders = (includeContentType = false) => {
    const token = getToken();

    const headers = {};

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  // CHECK USER ROLE
  useEffect(() => {
    const token = getToken();
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (!["delivery_driver", "admin"].includes(user.role)) {
        navigate("/", { replace: true });
        return;
      }

      setAuthChecked(true);
    } catch (error) {
      console.error("Authentication error:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // LOAD ORDERS FROM DATABASE
  const loadOrders = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load orders");
      }

      const data = await response.json();

      const allOrders = data.map((order) => ({
        ...order,
        id: order.id || order.orderId,
        orderId: order.orderId || order.id,
        name: order.name || order.customer?.name || "Customer",
        phone: order.phone || order.customer?.phone || "",
        address: order.address || order.customer?.address || "",
        city: order.city || order.customer?.city || "",
        items: order.items || order.cart || [],
        createdAt: order.createdAt || order.created_at,
      }));

      const deliveryOrders = allOrders.filter(
        (order) => order.status === "Out for Delivery"
      );

      if (
        previousDeliveryCount.current !== null &&
        deliveryOrders.length > previousDeliveryCount.current
      ) {
        setNewDeliveryAlert(true);

        setTimeout(() => {
          setNewDeliveryAlert(false);
        }, 4000);
      }

      previousDeliveryCount.current = deliveryOrders.length;

      setOrders(deliveryOrders);

      localStorage.setItem(
        "cloudKitchenOrders",
        JSON.stringify(allOrders)
      );
    } catch (error) {
      console.error("Error loading delivery orders:", error);
    }
  };

  // AUTOMATIC REFRESH
  useEffect(() => {
    if (!authChecked) return;

    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, [authChecked]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // MARK AS DELIVERED
  const markAsDelivered = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            status: "Delivered",
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not update delivery status"
        );
      }

      alert(`Order ${orderId} marked as Delivered!`);

      await loadOrders();
    } catch (error) {
      console.error("Error updating delivery:", error);
      alert("Could not update delivery status. Please try again.");
    }
  };

  // FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "N/A";

    const date = new Date(time);

    if (isNaN(date.getTime())) {
      return time;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // WAIT FOR AUTHENTICATION CHECK
  if (!authChecked) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div className="delivery-page">

      {/* NEW DELIVERY ALERT */}
      {newDeliveryAlert && (
        <div className="delivery-alert">
          <div className="delivery-alert-icon">🚚</div>

          <div>
            <strong>New Delivery Assigned!</strong>
            <span>A new order is ready for delivery.</span>
          </div>

          <button onClick={() => setNewDeliveryAlert(false)}>
            ×
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="delivery-header">
        <div className="delivery-title">
          <div className="delivery-logo">🚚</div>

          <div>
            <h1>Delivery Driver</h1>
            <p>Manage assigned food deliveries</p>
          </div>
        </div>

        <div className="delivery-header-right">
          <div className="driver-status">
            <span className="driver-live-dot"></span>
            ONLINE
          </div>

          <button
            className="delivery-refresh"
            onClick={loadOrders}
          >
            ↻ Refresh
          </button>

          <button
            className="delivery-refresh"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* STATISTICS */}
      <section className="delivery-stats">
        <div className="delivery-stat">
          <div className="delivery-stat-icon">🚚</div>

          <div>
            <span>Assigned Deliveries</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="delivery-stat">
          <div className="delivery-stat-icon">📦</div>

          <div>
            <span>Orders to Deliver</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="delivery-stat">
          <div className="delivery-stat-icon">🟢</div>

          <div>
            <span>Driver Status</span>
            <strong>Online</strong>
          </div>
        </div>
      </section>

      {/* DELIVERY BOARD */}
      <main className="delivery-board">
        <div className="delivery-board-title">
          <div>
            <h2>Assigned Deliveries</h2>
            <p>Orders ready to be delivered</p>
          </div>

          <span className="delivery-count">
            {orders.length}{" "}
            {orders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="delivery-empty">
            <div className="delivery-empty-icon">🚚</div>

            <h2>No Deliveries</h2>

            <p>
              Orders sent from the kitchen will appear here.
            </p>
          </div>
        ) : (
          <div className="delivery-grid">
            {orders.map((order) => {
              const customerName =
                order.name || order.customer?.name || "Customer";

              const customerPhone =
                order.phone || order.customer?.phone || "";

              const customerAddress =
                order.address ||
                order.customer?.address ||
                "Address not available";

              const orderItems =
                order.items || order.cart || [];

              const orderId =
                order.orderId || order.id || "N/A";

              return (
                <div className="delivery-card" key={orderId}>

                  {/* CARD HEADER */}
                  <div className="delivery-card-header">
                    <div>
                      <span className="delivery-order-label">
                        DELIVERY ORDER
                      </span>

                      <h2>#{orderId}</h2>
                    </div>

                    <div className="delivery-time">
                      🕐 {formatTime(order.createdAt)}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="delivery-status">
                    🚚 Out for Delivery
                  </div>

                  {/* CUSTOMER */}
                  <div className="delivery-customer">
                    <h3>👤 {customerName}</h3>

                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone}`}
                        className="phone-link"
                      >
                        📞 {customerPhone}
                      </a>
                    )}

                    <div className="address-box">
                      <span>📍 Delivery Address</span>

                      <strong>{customerAddress}</strong>

                      {order.city && (
                        <small>{order.city}</small>
                      )}
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="delivery-items">
                    <h3>Order Items</h3>

                    {orderItems.length === 0 ? (
                      <p className="delivery-no-items">
                        No food items found.
                      </p>
                    ) : (
                      orderItems.map((item, index) => (
                        <div
                          className="delivery-item"
                          key={item.id || item.name || index}
                        >
                          <div className="delivery-item-quantity">
                            {item.quantity}×
                          </div>

                          <div className="delivery-item-info">
                            <strong>{item.name}</strong>

                            {item.category && (
                              <span>{item.category}</span>
                            )}
                          </div>

                          <div className="delivery-item-price">
                            Rs.{" "}
                            {Number(item.price || 0) *
                              Number(item.quantity || 1)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* PAYMENT */}
                  <div className="delivery-payment">
                    <span>Payment</span>

                    <strong>
                      {order.paymentMethod || "Cash on Delivery"}
                    </strong>
                  </div>

                  {/* TOTAL */}
                  <div className="delivery-total">
                    <span>Total Amount</span>

                    <strong>Rs. {order.total || 0}</strong>
                  </div>

                  {/* ACTION */}
                  <button
                    className="delivered-btn"
                    onClick={() => markAsDelivered(orderId)}
                  >
                    ✓ Mark as Delivered
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default DeliveryDriver;
