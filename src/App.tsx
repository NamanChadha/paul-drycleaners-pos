import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthGate } from './components/AuthGate'
import { Layout } from './components/Layout'
import { CustomersPage } from './pages/CustomersPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewOrderPage } from './pages/NewOrderPage'
import { OrdersPage } from './pages/OrdersPage'
import { PrintPage } from './pages/PrintPage'
import { SettingsPage } from './pages/SettingsPage'
import { DueTodayPage } from './pages/DueTodayPage'
import { UndeliveredPage } from './pages/UndeliveredPage'

export default function App() {
  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orders/new" element={<NewOrderPage />} />
            <Route path="/orders/:orderId/edit" element={<NewOrderPage />} />
            <Route path="/due-today" element={<DueTodayPage />} />
            <Route path="/undelivered" element={<UndeliveredPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId/print" element={<PrintPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGate>
  )
}
