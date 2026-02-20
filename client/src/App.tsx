import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './layouts/AppShell';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import InventoryLogsPage from './pages/InventoryLogsPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import BillingPage from './pages/BillingPage';
import AccountingPage from './pages/AccountingPage';
import ReportsPage from './pages/ReportsPage';
import MaintenancePage from './pages/MaintenancePage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage';
import LogsPage from './pages/LogsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/logs" element={<InventoryLogsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/create" element={<CreateOrderPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route element={<AppShell />}>
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/logs" element={<LogsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
