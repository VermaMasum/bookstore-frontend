import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Publishers from './pages/Publishers'
import Suppliers from './pages/Suppliers'
import Vendors from './pages/Vendors'
import Schools from './pages/Schools'
import Inventory from './pages/Inventory'
import PurchaseOrders from './pages/PurchaseOrders'
import VendorOrders from './pages/VendorOrders'
import BookSets from './pages/BookSets'
import SchoolOrders from './pages/SchoolOrders'
import Payments from './pages/Payments'
import Reconciliation from './pages/Reconciliation'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes — wrapped in Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="publishers" element={<Publishers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="schools" element={<Schools />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="vendor-orders" element={<VendorOrders />} />
          <Route path="book-sets" element={<BookSets />} />
          <Route path="school-orders" element={<SchoolOrders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reconciliation" element={<Reconciliation />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{ fontSize: '13px' }}
      />
    </BrowserRouter>
  )
}
