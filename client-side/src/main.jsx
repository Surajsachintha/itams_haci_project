import React from "react";
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import './index.css'
import App from "./App.jsx";
import ProtectedRoute from "./pages/components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Devices from "./pages/devices/Devices.jsx";;
import Computers from "./pages/computers/Computers.jsx";
import Seettings from "./pages/settings/Settings.jsx";
import Users from "./pages/users/Users.jsx";
import SetPassword from "./pages/SetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}/>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER', 'UNIT_ADMIN', 'TECHNICIAN', 'USER', 'STORCE', 'STATION']}> <Dashboard /> </ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER', 'UNIT_ADMIN', 'TECHNICIAN', 'USER', 'STATION']}> <Devices /> </ProtectedRoute>} />
      <Route path="/computers" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER', 'UNIT_ADMIN', 'TECHNICIAN', 'STATION']}> <Computers /> </ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['SUPER']}> <Seettings /> </ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER']}> <Users /> </ProtectedRoute>} />
    </Routes>
  </BrowserRouter>,
)
