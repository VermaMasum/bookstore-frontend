import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PortalLayout from './components/PortalLayout'
import PortalRoute from './components/PortalRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Publishers from './pages/Publishers'
import Companies from './pages/Companies'
import Schools from './pages/Schools'
import Inventory from './pages/Inventory'
import PurchaseOrders from './pages/PurchaseOrders'
import VendorOrders from './pages/VendorOrders'
import BookSets from './pages/BookSets'
import SchoolOrders from './pages/SchoolOrders'
import Payments from './pages/Payments'
import Reconciliation from './pages/Reconciliation'
import Invoices from './pages/Invoices'
import ShopSettings from './pages/ShopSettings'
import EodUpload from './pages/EodUpload'
import PortalLogin from './pages/portal/PortalLogin'
import PortalRegister from './pages/portal/PortalRegister'
import PortalHome from './pages/portal/PortalHome'
import PortalMyOrders from './pages/portal/PortalMyOrders'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes — wrapped in Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="publishers" element={<Publishers />} />
          <Route path="companies" element={<Companies />} />
          <Route path="schools" element={<Schools />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="vendor-orders" element={<VendorOrders />} />
          <Route path="book-sets" element={<BookSets />} />
          <Route path="school-orders" element={<SchoolOrders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="shop-settings" element={<ShopSettings />} />
          <Route path="eod-upload" element={<EodUpload />} />
        </Route>

        {/* Portal — public */}
        <Route path="/portal/login"    element={<PortalLogin />} />
        <Route path="/portal/register" element={<PortalRegister />} />

        {/* Portal — protected (END_USER) */}
        <Route path="/portal" element={<PortalRoute><PortalLayout /></PortalRoute>}>
          <Route index element={<PortalHome />} />
          <Route path="my-orders" element={<PortalMyOrders />} />
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
