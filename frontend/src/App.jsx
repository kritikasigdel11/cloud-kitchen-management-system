import { BrowserRouter, Routes, Route } from "react-router-dom";

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
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* CUSTOMER PAGES */}
        <Route
          path="/menu"
          element={<Menu />}
        />

        <Route
          path="/recommendations"
          element={<Recommendations />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* ORDER SUCCESS */}
        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route path="/kitchen" element={<KitchenDisplay />} />
        <Route
  path="/delivery"
  element={<DeliveryDriver />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;