import { useEffect, useState } from "react";
import "./KitchenDisplay.css";

function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [previousOrderCount, setPreviousOrderCount] =
    useState(0);

  /* =========================
     LOAD ORDERS
  ========================= */

  const loadOrders = () => {
    const savedOrders =
      JSON.parse(
        localStorage.getItem(
          "cloudKitchenOrders"
        )
      ) || [];


    // Detect new order
    if (
      previousOrderCount > 0 &&
      savedOrders.length >
        previousOrderCount
    ) {
      setNewOrderAlert(true);

      setTimeout(() => {
        setNewOrderAlert(false);
      }, 4000);
    }


    setOrders(savedOrders);

    setPreviousOrderCount(
      savedOrders.length
    );
  };


  /* =========================
     AUTOMATIC REFRESH
  ========================= */

  useEffect(() => {

    loadOrders();


    const handleStorageChange = () => {
      loadOrders();
    };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    const interval =
      setInterval(() => {
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


  /* =========================
     UPDATE ORDER STATUS
  ========================= */

  const updateOrderStatus = (
    orderId,
    newStatus
  ) => {

    const updatedOrders =
  orders.map((order) => {
    const currentOrderId =
      order.id || order.orderId;

    return currentOrderId === orderId
      ? {
          ...order,
          id: order.id || order.orderId,
          orderId: order.orderId || order.id,
          status: newStatus,
        }
      : order;
  });

    setOrders(
      updatedOrders
    );


    localStorage.setItem(
      "cloudKitchenOrders",
      JSON.stringify(
        updatedOrders
      )
    );

  };


  /* =========================
     ACTIVE KITCHEN ORDERS
  ========================= */

  const kitchenOrders =
    orders.filter(
      (order) =>
        order.status === "Pending" ||
        order.status === "Preparing" ||
        order.status === "Ready"
    );


  /* =========================
     COUNTS
  ========================= */

  const pendingCount =
    orders.filter(
      (order) =>
        order.status === "Pending"
    ).length;


  const preparingCount =
    orders.filter(
      (order) =>
        order.status === "Preparing"
    ).length;


  const readyCount =
    orders.filter(
      (order) =>
        order.status === "Ready"
    ).length;


  /* =========================
     FORMAT TIME
  ========================= */

  const formatTime = (time) => {

    if (!time) {
      return "N/A";
    }


    const date =
      new Date(time);


    if (
      isNaN(
        date.getTime()
      )
    ) {
      return time;
    }


    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  /* =========================
     PAGE
  ========================= */

  return (

    <div className="kds-page">


      {/* =========================
          NEW ORDER ALERT
      ========================= */}

      {newOrderAlert && (

        <div className="new-order-alert">

          <div className="alert-icon">
            🔔
          </div>


          <div>

            <strong>
              New Order Received!
            </strong>

            <span>
              A new customer order
              is ready for the kitchen.
            </span>

          </div>


          <button
            onClick={() =>
              setNewOrderAlert(false)
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =========================
          HEADER
      ========================= */}

      <header className="kds-header">

        <div className="kds-title">

          <div className="kds-logo">
            👨‍🍳
          </div>


          <div>

            <h1>
              Kitchen Display System
            </h1>

            <p>
              Live kitchen order
              management
            </p>

          </div>

        </div>


        <div className="kds-header-right">

          <div className="kds-live">

            <span className="live-dot"></span>

            LIVE

          </div>


          <button
            className="refresh-btn"
            onClick={loadOrders}
          >
            ↻ Refresh
          </button>

        </div>

      </header>


      {/* =========================
          STATISTICS
      ========================= */}

      <section className="kds-stats">


        <div className="kds-stat pending-stat">

          <div className="stat-icon">
            🆕
          </div>

          <div>

            <span>
              Pending
            </span>

            <strong>
              {pendingCount}
            </strong>

          </div>

        </div>


        <div className="kds-stat preparing-stat">

          <div className="stat-icon">
            👨‍🍳
          </div>

          <div>

            <span>
              Preparing
            </span>

            <strong>
              {preparingCount}
            </strong>

          </div>

        </div>


        <div className="kds-stat ready-stat">

          <div className="stat-icon">
            ✅
          </div>

          <div>

            <span>
              Ready
            </span>

            <strong>
              {readyCount}
            </strong>

          </div>

        </div>

      </section>


      {/* =========================
          KITCHEN BOARD
      ========================= */}

      <main className="kds-board">


        {kitchenOrders.length === 0 ? (

          <div className="kds-empty">

            <div className="empty-icon">
              🍽️
            </div>

            <h2>
              No Active Orders
            </h2>

            <p>
              New customer orders
              will appear here
              automatically.
            </p>

          </div>

        ) : (

          <div className="kds-order-grid">


            {kitchenOrders.map(
              (order) => {


                // Support both old
                // and new order formats
                const customerName =
                  order.name ||
                  order.customer?.name ||
                  "Customer";


                const customerPhone =
                  order.phone ||
                  order.customer?.phone ||
                  "";


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
                    className={`kds-order-card ${
                      order.status
                        ?.toLowerCase()
                        .replaceAll(
                          " ",
                          "-"
                        )
                    }`}
                    key={orderId}
                  >


                    {/* =====================
                        ORDER HEADER
                    ====================== */}

                    <div className="order-card-header">

                      <div>

                        <span className="order-label">
                          ORDER
                        </span>

                        <h2>
                          #{orderId}
                        </h2>

                      </div>


                      <div className="order-time">

                        🕐{" "}

                        {formatTime(
                          order.createdAt
                        )}

                      </div>

                    </div>


                    {/* =====================
                        STATUS
                    ====================== */}

                    <div
                      className={`kds-status ${
                        order.status
                          ?.toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )
                      }`}
                    >

                      {order.status ===
                        "Pending" &&
                        "🆕 "}

                      {order.status ===
                        "Preparing" &&
                        "👨‍🍳 "}

                      {order.status ===
                        "Ready" &&
                        "✅ "}

                      {order.status}

                    </div>


                    {/* =====================
                        CUSTOMER
                    ====================== */}

                    <div className="kds-customer">

                      <strong>
                        {customerName}
                      </strong>


                      {customerPhone && (

                        <span>
                          📞{" "}
                          {customerPhone}
                        </span>

                      )}


                      {(order.address ||
                        order.customer?.address) && (

                        <span>
                          📍{" "}
                          {order.address ||
                            order.customer
                              ?.address}
                        </span>

                      )}

                    </div>


                    {/* =====================
                        FOOD ITEMS
                    ====================== */}

                    <div className="kds-items">

                      <h3>
                        Order Items
                      </h3>


                      {orderItems.length ===
                      0 ? (

                        <p className="no-items">
                          No food items found.
                        </p>

                      ) : (

                        orderItems.map(
                          (
                            item,
                            index
                          ) => (

                            <div
                              className="kds-item"
                              key={
                                item.id ||
                                item.name ||
                                index
                              }
                            >


                              <div className="item-quantity">
                                {item.quantity}×
                              </div>


                              <div className="item-info">

                                <strong>
                                  {item.name}
                                </strong>


                                {item.category && (

                                  <span>
                                    {
                                      item.category
                                    }
                                  </span>

                                )}

                              </div>


                              <div className="item-price">

                                Rs.{" "}

                                {item.price *
                                  item.quantity}

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>


                    {/* =====================
                        PAYMENT
                    ====================== */}

                    <div className="kds-payment">

                      <span>
                        Payment
                      </span>

                      <strong>
                        {order.paymentMethod ||
                          "Cash on Delivery"}
                      </strong>

                    </div>


                    {/* =====================
                        TOTAL
                    ====================== */}

                    <div className="kds-total">

                      <span>
                        Total
                      </span>

                      <strong>
                        Rs.{" "}
                        {order.total || 0}
                      </strong>

                    </div>


                    {/* =====================
                        ACTIONS
                    ====================== */}

                    <div className="kds-actions">


                      {order.status ===
                        "Pending" && (

                        <button
                          className="start-btn"
                          onClick={() =>
                            updateOrderStatus(
                              orderId,
                              "Preparing"
                            )
                          }
                        >
                          👨‍🍳 Start Preparing
                        </button>

                      )}


                      {order.status ===
                        "Preparing" && (

                        <button
                          className="ready-btn"
                          onClick={() =>
                            updateOrderStatus(
                              orderId,
                              "Ready"
                            )
                          }
                        >
                          ✅ Mark as Ready
                        </button>

                      )}


                      {order.status ===
                        "Ready" && (

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

              }
            )}

          </div>

        )}

      </main>

    </div>

  );

}

export default KitchenDisplay;