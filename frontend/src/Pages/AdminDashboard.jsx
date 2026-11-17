import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import "./AdminOrders.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  // Read the login token saved by the Login page.
  const getAccessToken = () =>
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const getAuthHeaders = (includeJson = false) => {
    const token = getAccessToken();
    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // =====================================================
  // DEFAULT INVENTORY
  // =====================================================

  const defaultInventory = [
    { id: 1, name: "Maida Flour", stock: 25, unit: "kg", reorderLevel: 5 },
    { id: 2, name: "Chicken Meat", stock: 15, unit: "kg", reorderLevel: 4 },
    { id: 3, name: "Cooking Oil", stock: 3, unit: "ltr", reorderLevel: 5 },
    { id: 4, name: "Onions & Spices", stock: 10, unit: "kg", reorderLevel: 3 },
    { id: 5, name: "Mozzarella Cheese", stock: 0, unit: "kg", reorderLevel: 2 },
    { id: 6, name: "Basmati Rice", stock: 30, unit: "kg", reorderLevel: 6 },
    { id: 7, name: "Coca-Cola Cans", stock: 45, unit: "pcs", reorderLevel: 10 },
  ];

  // =====================================================
  // LOAD DATA FROM BACKEND & LOCAL STORAGE
  // =====================================================

  useEffect(() => {
    let savedOrders = [];
    let savedInventory = [];

    try {
      const parsedOrders = JSON.parse(
        localStorage.getItem("cloudKitchenOrders") || "[]"
      );
      savedOrders = Array.isArray(parsedOrders) ? parsedOrders : [];
    } catch (error) {
      console.error("Could not read saved orders:", error);
    }
    setOrders(savedOrders);

    try {
      const parsedInventory = JSON.parse(
        localStorage.getItem("cloudKitchenInventory") || "[]"
      );
      savedInventory = Array.isArray(parsedInventory) ? parsedInventory : [];
    } catch (error) {
      console.error("Could not read saved inventory:", error);
    }

    if (savedInventory.length > 0) {
      setInventoryItems(savedInventory);
    } else {
      setInventoryItems(defaultInventory);
      localStorage.setItem(
        "cloudKitchenInventory",
        JSON.stringify(defaultInventory)
      );
    }

    // Load menu items from Flask backend
    const loadMenu = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/menu");
        if (!response.ok) {
          throw new Error("Could not load menu items");
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Menu loading error:", error);
        alert("Could not load menu. Please check whether Flask is running.");
      }
    };

    loadMenu();
  }, []);

  // =====================================================
  // ORDER FUNCTIONS
  // =====================================================

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) =>
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("cloudKitchenOrders", JSON.stringify(updatedOrders));
  };

  const deleteOrder = (orderId) => {
    const updatedOrders = orders.filter((order) => order.orderId !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem("cloudKitchenOrders", JSON.stringify(updatedOrders));
  };

  // =====================================================
  // MENU FUNCTIONS - CONNECTED TO FLASK API
  // =====================================================

  const addMenuItem = async () => {
    const name = window.prompt("Enter food name:");
    if (!name || !name.trim()) return;

    const category = window.prompt(
      "Enter category (Pizza, Burgers, Nepali, Noodles, Healthy, Drinks, Desserts, Snacks, Rice):"
    );
    if (!category || !category.trim()) return;

    const price = Number(window.prompt("Enter food price:"));
    if (!Number.isFinite(price) || price <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/menu", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          price: price,
          image: null,
          is_available: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add food item");
      }

      const added = data.item || data;
      setMenuItems((previous) => [...previous, added]);
      alert("Food item added successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/menu/${id}`,
        { method: "DELETE", headers: getAuthHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete food item");
      }

      setMenuItems((previous) => previous.filter((item) => item.id !== id));
      alert("Food item deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const updateMenuItem = async (id, field, value) => {
    const item = menuItems.find((food) => food.id === id);
    if (!item) return;

    const updatedItem = {
      name: field === "name" ? value : item.name,
      category: field === "category" ? value : item.category,
      price: field === "price" ? Number(value) : item.price,
      image: item.image,
      is_available: item.is_available,
    };

    // Update state immediately for responsive typing
    setMenuItems((previous) =>
      previous.map((food) =>
        food.id === id
          ? {
              ...food,
              [field]: field === "price" ? Number(value) : value,
            }
          : food
      )
    );

    // Save to database only if values are valid
    if (
      !updatedItem.name.trim() ||
      !updatedItem.category.trim() ||
      !Number.isFinite(updatedItem.price) ||
      updatedItem.price <= 0
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/menu/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify(updatedItem),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update food item");
      }

      const updated = data.item || data;
      setMenuItems((previous) =>
        previous.map((food) => (food.id === id ? updated : food))
      );
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const toggleMenuAvailability = async (id) => {
    const item = menuItems.find((food) => food.id === id);
    if (!item) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/menu/${id}/availability`,
        {
          method: "PATCH",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ is_available: !item.is_available }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update availability");
      }

      const updated = data.item || data;
      setMenuItems((previous) =>
        previous.map((food) => (food.id === id ? updated : food))
      );
    } catch (error) {
      alert(error.message);
    }
  };

  // =====================================================
  // INVENTORY FUNCTIONS
  // =====================================================

  const addInventoryItem = () => {
    const newItem = {
      id: Date.now(),
      name: "New Ingredient",
      stock: 10,
      unit: "kg",
      reorderLevel: 3,
    };
    const updatedInventory = [...inventoryItems, newItem];
    setInventoryItems(updatedInventory);
    localStorage.setItem(
      "cloudKitchenInventory",
      JSON.stringify(updatedInventory)
    );
  };

  const deleteInventoryItem = (id) => {
    const updatedInventory = inventoryItems.filter((item) => item.id !== id);
    setInventoryItems(updatedInventory);
    localStorage.setItem(
      "cloudKitchenInventory",
      JSON.stringify(updatedInventory)
    );
  };

  const updateInventoryItem = (id, field, value) => {
    const updatedInventory = inventoryItems.map((item) =>
      item.id === id
        ? {
            ...item,
            [field]:
              field === "stock" || field === "reorderLevel"
                ? Number(value)
                : value,
          }
        : item
    );
    setInventoryItems(updatedInventory);
    localStorage.setItem(
      "cloudKitchenInventory",
      JSON.stringify(updatedInventory)
    );
  };

  // =====================================================
  // STATISTICS & ANALYTICS CALCULATIONS
  // =====================================================

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const preparingOrders = orders.filter(
    (order) => order.status === "Preparing"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const totalSales = orders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  const lowStockCount = inventoryItems.filter(
    (item) => item.stock > 0 && item.stock <= item.reorderLevel
  ).length;

  const outOfStockCount = inventoryItems.filter(
    (item) => item.stock <= 0
  ).length;

  // =====================================================
  // DASHBOARD TAB RENDER
  // =====================================================

  const renderDashboard = () => {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, Admin 👋</p>
          </div>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div>
              <span>Total Orders</span>
              <strong>{totalOrders}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div>
              <span>Pending Orders</span>
              <strong>{pendingOrders}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👨‍🍳</div>
            <div>
              <span>Preparing</span>
              <strong>{preparingOrders}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <span>Total Sales</span>
              <strong>Rs. {totalSales}</strong>
            </div>
          </div>
        </div>

        <div className="section-title">
          <h2>Quick Actions</h2>
          <p>Manage your cloud kitchen easily</p>
        </div>

        <div className="quick-actions">
          <button
            onClick={() => setActiveTab("Orders")}
            className="quick-card"
          >
            <span>🛒</span>
            <strong>Manage Orders</strong>
            <small>View and update customer orders</small>
          </button>

          <button onClick={() => setActiveTab("Menu")} className="quick-card">
            <span>🍔</span>
            <strong>Manage Menu</strong>
            <small>Add or edit food items</small>
          </button>

          <button
            onClick={() => setActiveTab("Inventory")}
            className="quick-card"
          >
            <span>📦</span>
            <strong>Check Inventory</strong>
            <small>Manage ingredients and stock</small>
          </button>

          <button
            onClick={() => setActiveTab("Reports")}
            className="quick-card"
          >
            <span>📊</span>
            <strong>View Reports</strong>
            <small>Check sales and order reports</small>
          </button>
        </div>

        <div className="section-title">
          <h2>Recent Orders</h2>
          <p>Latest customer orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div>📦</div>
            <h3>No Orders Yet</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .slice(-5)
                  .reverse()
                  .map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <strong>{order.orderId}</strong>
                      </td>
                      <td>{order.customer?.name}</td>
                      <td>{order.cart?.length || 0} items</td>
                      <td>Rs. {order.total}</td>
                      <td>
                        <span
                          className={`status-badge ${order.status
                            ?.toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // ORDERS TAB RENDER
  // =====================================================

  const renderOrders = () => {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Order Management</h1>
            <p>View and manage customer orders</p>
          </div>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div>📦</div>
            <h3>No Orders Found</h3>
            <p>There are currently no customer orders.</p>
          </div>
        ) : (
          <div className="order-management-grid">
            {orders.map((order) => (
              <div className="order-management-card" key={order.orderId}>
                <div className="order-card-top">
                  <div>
                    <span className="order-label">Order ID</span>
                    <h3>{order.orderId}</h3>
                  </div>
                  <strong className="order-price">Rs. {order.total}</strong>
                </div>

                <div className="customer-details">
                  <p>
                    📞 <strong>{order.customer?.phone}</strong>
                  </p>
                  <p>
                    📍 {order.customer?.address}, {order.customer?.city}
                  </p>
                  <p>💳 {order.paymentMethod}</p>
                </div>

                <div className="order-items">
                  {order.cart?.map((item, index) => (
                    <div
                      className="admin-order-item"
                      key={`${item.name}-${index}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <span className="admin-item-emoji">
                          {item.icon || "🍲"}
                        </span>
                      )}
                      <div>
                        <strong>{item.name}</strong>
                        <span>× {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-status-section">
                  <label>Order Status</label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order.orderId, e.target.value)
                    }
                  >
                    <option>Pending</option>
                    <option>Preparing</option>
                    <option>Ready</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                  </select>
                </div>

                <button
                  className="delete-order-btn"
                  onClick={() => deleteOrder(order.orderId)}
                >
                  🗑️ Delete Order
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // MENU TAB RENDER
  // =====================================================

  const renderMenu = () => {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Menu Management</h1>
            <p>Add, edit and manage your food items</p>
          </div>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>

        <div className="menu-admin-top">
          <div>
            <h2>Food Menu</h2>
            <p>Manage the dishes available to customers.</p>
          </div>

          <button className="add-menu-btn" onClick={addMenuItem}>
            + Add Food Item
          </button>
        </div>

        <div className="menu-count">
          <span>{menuItems.length} food items</span>
          <span>
            {menuItems.filter((item) => item.is_available).length} available
          </span>
        </div>

        {menuItems.length === 0 ? (
          <div className="empty-state">
            <div>🍔</div>
            <h3>No Menu Items</h3>
            <p>Click "Add Food Item" to create your first menu item.</p>
          </div>
        ) : (
          <div className="admin-menu-grid">
            {menuItems.map((item) => (
              <div className="admin-menu-card" key={item.id}>
                <div className="admin-menu-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="no-image">🍽️</div>
                  )}

                  <span
                    className={
                      item.is_available
                        ? "available-badge"
                        : "unavailable-badge"
                    }
                  >
                    {item.is_available ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="admin-menu-info">
                  <label>Food Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updateMenuItem(item.id, "name", e.target.value)
                    }
                  />

                  <label>Category</label>
                  <select
                    value={item.category}
                    onChange={(e) =>
                      updateMenuItem(item.id, "category", e.target.value)
                    }
                  >
                    <option>Pizza</option>
                    <option>Burgers</option>
                    <option>Nepali</option>
                    <option>Noodles</option>
                    <option>Healthy</option>
                    <option>Drinks</option>
                    <option>Desserts</option>
                    <option>Snacks</option>
                    <option>Rice</option>
                  </select>

                  <label>Price</label>
                  <div className="price-input">
                    <span>Rs.</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateMenuItem(item.id, "price", e.target.value)
                      }
                    />
                  </div>

                  <div className="menu-card-actions">
                    <button
                      className={
                        item.is_available
                          ? "availability-btn"
                          : "availability-btn inactive"
                      }
                      onClick={() => toggleMenuAvailability(item.id)}
                    >
                      {item.is_available ? "✓ Available" : "✕ Unavailable"}
                    </button>

                    <button
                      className="delete-menu-btn"
                      onClick={() => deleteMenuItem(item.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // INVENTORY TAB RENDER
  // =====================================================

  const renderInventory = () => {
    return (
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Inventory Management 📦</h1>
            <p>Monitor raw ingredients, stock levels and reorder alerts</p>
          </div>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>

        {/* INVENTORY STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div>
              <span>Total Ingredients</span>
              <strong>{inventoryItems.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div>
              <span>Low Stock Alerts</span>
              <strong>{lowStockCount}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚫</div>
            <div>
              <span>Out of Stock</span>
              <strong>{outOfStockCount}</strong>
            </div>
          </div>
        </div>

        {/* INVENTORY TOP ACTION BAR */}
        <div className="menu-admin-top">
          <div>
            <h2>Raw Ingredients & Stock</h2>
            <p>Edit stock levels, units, and reorder levels below.</p>
          </div>

          <button className="add-menu-btn" onClick={addInventoryItem}>
            ➕ Add Ingredient
          </button>
        </div>

        {/* INVENTORY GRID CARDS */}
        {inventoryItems.length === 0 ? (
          <div className="empty-state">
            <div>📦</div>
            <h3>No Inventory Items Found</h3>
            <p>Click "Add Ingredient" to start tracking raw ingredients.</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {inventoryItems.map((item) => {
              let statusLabel = "🟢 Good Stock";
              let statusClass = "good-stock";

              if (item.stock <= 0) {
                statusLabel = "🔴 Out of Stock";
                statusClass = "out-of-stock";
              } else if (item.stock <= item.reorderLevel) {
                statusLabel = "🟠 Low Stock Alert";
                statusClass = "low-stock";
              }

              return (
                <div className="inventory-card" key={item.id}>
                  <div className="inventory-card-header">
                    <span className={`inventory-status-badge ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <button
                      className="delete-menu-btn"
                      onClick={() => deleteInventoryItem(item.id)}
                      title="Delete Ingredient"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="admin-menu-info">
                    <label>Ingredient Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateInventoryItem(item.id, "name", e.target.value)
                      }
                      placeholder="e.g., Maida Flour"
                    />

                    <div className="form-row-2col">
                      <div>
                        <label>Current Stock</label>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) =>
                            updateInventoryItem(item.id, "stock", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label>Unit 📏</label>
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateInventoryItem(item.id, "unit", e.target.value)
                          }
                        >
                          <option value="kg">kg</option>
                          <option value="ltr">ltr</option>
                          <option value="pcs">pcs</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="packs">packs</option>
                        </select>
                      </div>
                    </div>

                    <label>Reorder Level ⚠️</label>
                    <input
                      type="number"
                      value={item.reorderLevel}
                      onChange={(e) =>
                        updateInventoryItem(
                          item.id,
                          "reorderLevel",
                          e.target.value
                        )
                      }
                      placeholder="Alert when stock falls below"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // REPORTS TAB RENDER
  // =====================================================

  const renderReports = () => {
    const foodCountMap = {};
    orders.forEach((order) => {
      const items = Array.isArray(order.cart)
        ? order.cart
        : Array.isArray(order.items)
        ? order.items
        : [];
      items.forEach((item) => {
        if (item.name) {
          foodCountMap[item.name] =
            (foodCountMap[item.name] || 0) + Number(item.quantity || 1);
        }
      });
    });

    const popularItems = Object.entries(foodCountMap).sort(
      (a, b) => b[1] - a[1]
    );

    return (
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>Reports & Analytics 📊</h1>
            <p>View cloud kitchen sales performance, food orders and statistics</p>
          </div>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>

        {/* REPORT CONTENT: TWO COLUMNS */}
        <div className="reports-two-column">
          {/* POPULAR FOOD PANEL */}
          <div className="report-panel popular-food-panel">
            <div className="report-panel-header">
              <div>
                <h2>🍔 Popular Food Items</h2>
                <p>Most ordered food items</p>
              </div>
              <span className="report-count">
                {popularItems.length} foods
              </span>
            </div>

            {popularItems.length === 0 ? (
              <div className="report-empty">
                <span>🍽️</span>
                <p>No food sales data available yet.</p>
              </div>
            ) : (
              <div className="popular-food-list">
                {popularItems.map(([name, quantity], index) => (
                  <div className="popular-food-row" key={name}>
                    <div className="food-rank">#{index + 1}</div>

                    <div className="food-name">
                      <strong>{name}</strong>
                      <span>
                        {quantity} {Number(quantity) === 1 ? "item" : "items"} ordered
                      </span>
                    </div>

                    <div className="food-quantity">{quantity}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SALES OVERVIEW PANEL */}
          <div className="report-panel sales-panel">
            <div className="report-panel-header">
              <div>
                <h2>💵 Sales Overview</h2>
                <p>Current order sales information</p>
              </div>
            </div>

            <div className="sales-overview">
              <div className="sales-row">
                <span>Total Orders</span>
                <strong>{totalOrders}</strong>
              </div>

              <div className="sales-row">
                <span>Delivered Orders</span>
                <strong>{completedOrders}</strong>
              </div>

              <div className="sales-row">
                <span>Pending Orders</span>
                <strong>{pendingOrders}</strong>
              </div>

              <div className="sales-row total">
                <span>Total Sales</span>
                <strong>Rs. {Number(totalSales).toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="section-title">
          <h2>Recent Orders</h2>
          <p>Latest orders included in the report</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div>📊</div>
            <h3>No Report Data</h3>
            <p>Customer orders will appear here after orders are placed.</p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {orders
                  .slice(-8)
                  .reverse()
                  .map((order, index) => {
                    const orderId =
                      order.orderId || order.id || `Order-${index + 1}`;
                    const customerName =
                      order.customer?.name || order.name || "Customer";
                    const items = Array.isArray(order.cart)
                      ? order.cart
                      : Array.isArray(order.items)
                      ? order.items
                      : [];
                    const status = order.status || "Pending";

                    return (
                      <tr key={orderId}>
                        <td>
                          <strong>{orderId}</strong>
                        </td>
                        <td>{customerName}</td>
                        <td>{items.length} items</td>
                        <td>Rs. {Number(order.total || 0)}</td>
                        <td>
                          <span
                            className={`status-badge ${status
                              .toLowerCase()
                              .replace(/\\s+/g, "-")}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // =====================================================
  // CONTENT ROUTER
  // =====================================================

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return renderDashboard();
      case "Orders":
        return renderOrders();
      case "Menu":
        return renderMenu();
      case "Inventory":
        return renderInventory();
      case "Reports":
        return renderReports();
      default:
        return renderDashboard();
    }
  };

  // =====================================================
  // ADMIN DASHBOARD LAYOUT
  // =====================================================

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        {/* LOGO */}
        <div className="admin-logo">
          🍽️ <span>Cloud Kitchen</span>
        </div>

        {/* NAVIGATION */}
        <nav className="admin-nav">
          <button
            className={activeTab === "Dashboard" ? "active" : ""}
            onClick={() => setActiveTab("Dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className={activeTab === "Orders" ? "active" : ""}
            onClick={() => setActiveTab("Orders")}
          >
            🛒 Orders
          </button>

          <button
            className={activeTab === "Menu" ? "active" : ""}
            onClick={() => setActiveTab("Menu")}
          >
            🍔 Menu
          </button>

          <button
            className={activeTab === "Inventory" ? "active" : ""}
            onClick={() => setActiveTab("Inventory")}
          >
            📦 Inventory
          </button>

          <button
            className={activeTab === "Reports" ? "active" : ""}
            onClick={() => setActiveTab("Reports")}
          >
            📈 Reports
          </button>
        </nav>

        {/* BOTTOM BUTTONS */}
        <div className="sidebar-bottom">
          <button onClick={() => navigate("/")}>
            🏠 Back to Website
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("access_token");
              sessionStorage.removeItem("access_token");
              localStorage.removeItem("token");
              sessionStorage.removeItem("token");
              localStorage.removeItem("user");
              sessionStorage.removeItem("user");
              navigate("/login");
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">{renderContent()}</main>
    </div>
  );
}
export default AdminDashboard;
