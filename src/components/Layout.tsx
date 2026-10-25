import { NavLink, Outlet } from 'react-router-dom'
import { Shirt, LayoutDashboard, ReceiptIndianRupee, Users, Settings2, CalendarClock, PackageCheck } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders/new', label: 'New Order', icon: Shirt },
  { to: '/due-today', label: 'Due Today', icon: CalendarClock },
  { to: '/undelivered', label: 'Undelivered', icon: PackageCheck },
  { to: '/orders', label: 'Orders', icon: ReceiptIndianRupee },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings2 },
]

export function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand-name">Paul Drycleaners</p>
          <h1>Counter</h1>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  )
}
