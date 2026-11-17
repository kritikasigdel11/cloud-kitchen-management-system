import { useEffect, useState } from "react";
import "./DeliveryDriver.css";

function DeliveryDriver() {
  const [orders, setOrders] = useState([]);
  const [newDeliveryAlert, setNewDeliveryAlert] =
    useState(false);
  const [previousDeliveryCount, setPreviousDeliveryCount] =
    useState(0);

  const loadOrders = () => {
    const savedOrders =
      JSON.parse(
        localStorage.getItem("cloudKitchenOrders")
      ) || [];

    const deliveryOrders = savedOrders.filter(
      (order) =>
        order.status === "Out for Delivery"
    );

    if (
      previousDeliveryCount > 0 &&
      deliveryOrders.length >
        previousDeliveryCount
    ) {
      setNewDeliveryAlert(true);

      setTimeout(() => {
        setNewDeliveryAlert(false);
      }, 4000);
    }

    setOrders(deliveryOrders);

    setPreviousDeliveryCount(
      deliveryOrders.length
    );
  };

  useEffect(() => {
    loadOrders();

    const handleStorageChange = () => {
      loadOrders();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    const interval = setInterval(() => {
      loadOrders();
    }, 3000);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      clearInterval(interval);
    };
  }, []);

  const markAsDelivered = (orderId) => {
    const savedOrders =
      JSON.parse(
        localStorage.getItem("cloudKitchenOrders")
      ) || [];

    const updatedOrders = savedOrders.map(
      (order) => {
        const currentOrderId =
          order.id || order.orderId;

        if (currentOrderId === orderId) {
          return {
            ...order,
            id: order.id || order.orderId,
            orderId:
              order.orderId || order.id,
            status: "Delivered",
            deliveredAt:
              new Date().toISOString(),
          };
        }

        return order;
      }
    );

    localStorage.setItem(
      "cloudKitchenOrders",
      JSON.stringify(updatedOrders)
    );

    loadOrders();
  };

  const formatTime = (time) => {
    if (!time) {
      return "N/A";
    }

    const date = new Date(time);

    if (isNaN(date.getTime())) {
      return time;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="delivery-page">

      {newDeliveryAlert && (
        <div className="delivery-alert">
          <div className="delivery-alert-icon">
            🚚
          </div>

          <div>
            <strong>
              New Delivery Assigned!
            </strong>

            <span>
              A new order is ready for delivery.
            </span>
          </div>

          <button
            onClick={() =>
              setNewDeliveryAlert(false)
            }
          >
            ×
          </button>
        </div>
      )}

      {/* HEADER */}

      <header className="delivery-header">

        <div className="delivery-title">

          <div className="delivery-logo">
            🚚
          </div>

          <div>
            <h1>
              Delivery Driver
            </h1>

            <p>
              Manage assigned food deliveries
            </p>
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

        </div>

      </header>

      {/* STATS */}

      <section className="delivery-stats">

        <div className="delivery-stat">
          <div className="delivery-stat-icon">
            🚚
          </div>

          <div>
            <span>
              Assigned Deliveries
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>
        </div>

        <div className="delivery-stat">
          <div className="delivery-stat-icon">
            📦
          </div>

          <div>
            <span>
              Orders to Deliver
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>
        </div>

        <div className="delivery-stat">
          <div className="delivery-stat-icon">
            🟢
          </div>

          <div>
            <span>
              Driver Status
            </span>

            <strong>
              Online
            </strong>
          </div>
        </div>

      </section>

      {/* DELIVERY BOARD */}

      <main className="delivery-board">

        <div className="delivery-board-title">

          <div>
            <h2>
              Assigned Deliveries
            </h2>

            <p>
              Orders ready to be delivered
            </p>
          </div>

          <span className="delivery-count">
            {orders.length}{" "}
            {orders.length === 1
              ? "Order"
              : "Orders"}
          </span>

        </div>

        {orders.length === 0 ? (

          <div className="delivery-empty">

            <div className="delivery-empty-icon">
              🚚
            </div>

            <h2>
              No Deliveries
            </h2>

            <p>
              Orders sent from the kitchen
              will appear here.
            </p>

          </div>

        ) : (

          <div className="delivery-grid">

            {orders.map((order) => {

              const customerName =
                order.name ||
                order.customer?.name ||
                "Customer";

              const customerPhone =
                order.phone ||
                order.customer?.phone ||
                "";

              const customerAddress =
                order.address ||
                order.customer?.address ||
                "Address not available";

              const orderItems =
                order.items ||
                order.cart ||
                [];

              const orderId =
                order.id ||
                order.orderId ||
                "N/A";

              return (

                <div
                  className="delivery-card"
                  key={orderId}
                >

                  {/* CARD HEADER */}

                  <div className="delivery-card-header">

                    <div>
                      <span className="delivery-order-label">
                        DELIVERY ORDER
                      </span>

                      <h2>
                        #{orderId}
                      </h2>
                    </div>

                    <div className="delivery-time">
                      🕐{" "}
                      {formatTime(
                        order.createdAt
                      )}
                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="delivery-status">
                    🚚 Out for Delivery
                  </div>

                  {/* CUSTOMER */}

                  <div className="delivery-customer">

                    <h3>
                      👤 {customerName}
                    </h3>

                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone}`}
                        className="phone-link"
                      >
                        📞 {customerPhone}
                      </a>
                    )}

                    <div className="address-box">

                      <span>
                        📍 Delivery Address
                      </span>

                      <strong>
                        {customerAddress}
                      </strong>

                      {order.city && (
                        <small>
                          {order.city}
                        </small>
                      )}

                    </div>

                  </div>

                  {/* ITEMS */}

                  <div className="delivery-items">

                    <h3>
                      Order Items
                    </h3>

                    {orderItems.length === 0 ? (

                      <p className="delivery-no-items">
                        No food items found.
                      </p>

                    ) : (

                      orderItems.map(
                        (item, index) => (

                          <div
                            className="delivery-item"
                            key={
                              item.id ||
                              item.name ||
                              index
                            }
                          >

                            <div className="delivery-item-quantity">
                              {item.quantity}×
                            </div>

                            <div className="delivery-item-info">

                              <strong>
                                {item.name}
                              </strong>

                              {item.category && (
                                <span>
                                  {item.category}
                                </span>
                              )}

                            </div>

                            <div className="delivery-item-price">
                              Rs.{" "}
                              {item.price *
                                item.quantity}
                            </div>

                          </div>

                        )
                      )

                    )}

                  </div>

                  {/* PAYMENT */}

                  <div className="delivery-payment">

                    <span>
                      Payment
                    </span>

                    <strong>
                      {order.paymentMethod ||
                        "Cash on Delivery"}
                    </strong>

                  </div>

                  {/* TOTAL */}

                  <div className="delivery-total">

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      Rs.{" "}
                      {order.total || 0}
                    </strong>

                  </div>

                  {/* ACTION */}

                  <button
                    className="delivered-btn"
                    onClick={() =>
                      markAsDelivered(
                        orderId
                      )
                    }
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