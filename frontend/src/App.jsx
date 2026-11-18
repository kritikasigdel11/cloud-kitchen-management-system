import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./Pages/Home.jsx";
import Menu from "./Pages/Menu.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import Recommendations from "./Pages/Recommendations.jsx";
import Checkout from "./Pages/Checkout.jsx";
import OrderSuccess from "./Pages/OrderSuccess.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";
import KitchenDisplay from "./Pages/KitchenDisplay.jsx";
import DeliveryDriver from "./Pages/DeliveryDriver.jsx";

// Protected Route Component
function ProtectedRoute({ allowedRoles, children }) {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");

    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* CUSTOMER PAGES */}
        <Route path="/menu" element={<Menu />} />

        <Route
          path="/recommendations"
          element={<Recommendations />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* CHECKOUT */}
        <Route path="/checkout" element={<Checkout />} />

        {/* ORDER SUCCESS */}
        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* KITCHEN DISPLAY */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["kitchen_staff", "admin"]}>
              <KitchenDisplay />
            </ProtectedRoute>
          }
        />

        {/* DELIVERY DRIVER */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute allowedRoles={["delivery_driver", "admin"]}>
              <DeliveryDriver />
            </ProtectedRoute>
          }
        />

        {/* INVALID ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;