
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./KitchenDisplay.css";

const API_URL = "http://127.0.0.1:5000/api/orders";

function KitchenDisplay() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const previousOrderCount = useRef(null);

  // AUTHENTICATION PROTECTION
  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (!["kitchen_staff", "admin"].includes(user.role)) {
        navigate("/", { replace: true });
        return;
      }

      setAuthChecked(true);
    } catch (error) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // AUTHORIZATION HEADERS
  const getAuthHeaders = (includeJson = false) => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // LOAD ORDERS
  const loadOrders = async () => {
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Could not load orders");
    }

    const data = await response.json();

    const savedOrders = data.map((order) => ({
      ...order,
      id: order.id || order.orderId,
      orderId: order.orderId || order.id,
      name: order.name || order.customer?.name || "Customer",
      phone: order.phone || order.customer?.phone || "",
      address: order.address || order.customer?.address || "",
      items: order.items || order.cart || [],
      createdAt: order.createdAt || order.created_at,
    }));

      if (
        previousOrderCount.current !== null &&
        savedOrders.length > previousOrderCount.current
      ) {
        setNewOrderAlert(true);

        setTimeout(() => {
          setNewOrderAlert(false);
        }, 4000);
      }

      previousOrderCount.current = savedOrders.length;
      setOrders(savedOrders);

      localStorage.setItem(
        "cloudKitchenOrders",
        JSON.stringify(savedOrders)
      );
    } catch (error) {
      console.error("Error loading kitchen orders:", error);
    }
  };

  // AUTOMATIC REFRESH
  useEffect(() => {
    if (!authChecked) return;

    loadOrders();

    const interval = setInterval(loadOrders, 3000);

    return () => clearInterval(interval);
  }, [authChecked]);

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(orderId)}/status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not update order status"
        );
      }

      alert(`Order ${orderId} updated to ${newStatus}.`);

      await loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert(error.message || "Could not update order status.");
    }
  };

  if (!authChecked) {
    return null;
  }

  // ACTIVE KITCHEN ORDERS
  const kitchenOrders = orders.filter((order) =>
    ["Pending", "Preparing", "Ready"].includes(order.status)
  );

  // COUNTS
  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "Preparing"
  ).length;

  const readyCount = orders.filter(
    (order) => order.status === "Ready"
  ).length;

  // FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "N/A";

    const date = new Date(time);

    if (isNaN(date.getTime())) return time;

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="kds-page">

      {/* NEW ORDER ALERT */}
      {newOrderAlert && (
        <div className="new-order-alert">
          <div className="alert-icon">🔔</div>

          <div>
            <strong>New Order Received!</strong>
            <span>
              A new customer order is ready for the kitchen.
            </span>
          </div>

          <button onClick={() => setNewOrderAlert(false)}>
            ×
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="kds-header">
        <div className="kds-title">
          <div className="kds-logo">👨‍🍳</div>

          <div>
            <h1>Kitchen Display System</h1>
            <p>Live kitchen order management</p>
          </div>
        </div>

        <div className="kds-header-right">
          <div className="kds-live">
            <span className="live-dot"></span>
            LIVE
          </div>

          <button className="refresh-btn" onClick={loadOrders}>
            ↻ Refresh
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* STATISTICS */}
      <section className="kds-stats">
        <div className="kds-stat pending-stat">
          <div className="stat-icon">🆕</div>
          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="kds-stat preparing-stat">
          <div className="stat-icon">👨‍🍳</div>
          <div>
            <span>Preparing</span>
            <strong>{preparingCount}</strong>
          </div>
        </div>

        <div className="kds-stat ready-stat">
          <div className="stat-icon">✅</div>
          <div>
            <span>Ready</span>
            <strong>{readyCount}</strong>
          </div>
        </div>
      </section>

      {/* KITCHEN BOARD */}
      <main className="kds-board">
        {kitchenOrders.length === 0 ? (
          <div className="kds-empty">
            <div className="empty-icon">🍽️</div>
            <h2>No Active Orders</h2>
            <p>
              New customer orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="kds-order-grid">
            {kitchenOrders.map((order) => {
              const customerName =
                order.name || order.customer?.name || "Customer";

              const customerPhone =
                order.phone || order.customer?.phone || "";

              const customerAddress =
                order.address || order.customer?.address || "";

              const orderItems = order.items || order.cart || [];

              const orderId = order.orderId || order.id || "N/A";

              return (
                <div
                  className={`kds-order-card ${
                    order.status?.toLowerCase().replaceAll(" ", "-")
                  }`}
                  key={orderId}
                >

                  {/* ORDER HEADER */}
                  <div className="order-card-header">
                    <div>
                      <span className="order-label">ORDER</span>
                      <h2>#{orderId}</h2>
                    </div>

                    <div className="order-time">
                      🕐 {formatTime(order.createdAt)}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div
                    className={`kds-status ${
                      order.status?.toLowerCase().replaceAll(" ", "-")
                    }`}
                  >
                    {order.status === "Pending" && "🆕 "}
                    {order.status === "Preparing" && "👨‍🍳 "}
                    {order.status === "Ready" && "✅ "}
                    {order.status}
                  </div>

                  {/* CUSTOMER */}
                  <div className="kds-customer">
                    <strong>{customerName}</strong>

                    {customerPhone && (
                      <span>📞 {customerPhone}</span>
                    )}

                    {customerAddress && (
                      <span>📍 {customerAddress}</span>
                    )}
                  </div>

                  {/* FOOD ITEMS */}
                  <div className="kds-items">
                    <h3>Order Items</h3>

                    {orderItems.length === 0 ? (
                      <p className="no-items">
                        No food items found.
                      </p>
                    ) : (
                      orderItems.map((item, index) => (
                        <div
                          className="kds-item"
                          key={item.id || item.name || index}
                        >
                          <div className="item-quantity">
                            {item.quantity}×
                          </div>

                          <div className="item-info">
                            <strong>{item.name}</strong>

                            {item.category && (
                              <span>{item.category}</span>
                            )}
                          </div>

                          <div className="item-price">
                            Rs.{" "}
                            {Number(item.price || 0) *
                              Number(item.quantity || 1)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* PAYMENT */}
                  <div className="kds-payment">
                    <span>Payment</span>
                    <strong>
                      {order.paymentMethod || "Cash on Delivery"}
                    </strong>
                  </div>

                  {/* TOTAL */}
                  <div className="kds-total">
                    <span>Total</span>
                    <strong>Rs. {order.total || 0}</strong>
                  </div>

                  {/* ACTIONS */}
                  <div className="kds-actions">
                    {order.status === "Pending" && (
                      <button
                        className="start-btn"
                        onClick={() =>
                          updateOrderStatus(orderId, "Preparing")
                        }
                      >
                        👨‍🍳 Start Preparing
                      </button>
                    )}

                    {order.status === "Preparing" && (
                      <button
                        className="ready-btn"
                        onClick={() =>
                          updateOrderStatus(orderId, "Ready")
                        }
                      >
                        ✅ Mark as Ready
                      </button>
                    )}

                    {order.status === "Ready" && (
                      <button
                        className="complete-btn"
                        onClick={() =>
                          updateOrderStatus(
                            orderId,
                            "Out for Delivery"
                          )
                        }
                      >
                        🚚 Send to Delivery
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default KitchenDisplay;
