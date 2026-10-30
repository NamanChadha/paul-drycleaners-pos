import { Link } from 'react-router-dom'
import { useShopStore } from '../store/useShopStore'
import { todayIso } from '../utils/date'
import { formatMoney } from '../utils/money'

export function DashboardPage() {
  const { orders, customers } = useShopStore()
  const today = todayIso()
  const todayOrders = orders.filter((order) => order.receiptDate === today && order.status !== 'cancelled')
  const revenueToday = todayOrders.reduce((sum, order) => sum + order.paidAmount, 0)
  const pendingDeliveries = orders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled').length
  const dueToday = orders.filter((order) => order.deliveryDate <= today && order.status !== 'delivered' && order.status !== 'cancelled').length
  const pendingPayments = orders.filter((order) => order.dueAmount > 0 && order.status !== 'cancelled').length
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length
  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.totalDue, 0)
  const frequentCustomers = customers
    .map((customer) => ({ customer, receipts: orders.filter((order) => order.customerId === customer.id && order.status !== 'cancelled').length }))
    .filter(({ receipts }) => receipts > 1)
    .sort((a, b) => b.receipts - a.receipts || b.customer.totalDue - a.customer.totalDue)
    .slice(0, 5)

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Dashboard</h2>
        </div>
        <Link className="button primary" to="/orders/new">
          New order
        </Link>
      </header>
      <div className="metric-grid">
        <article><span>Orders today</span><strong>{todayOrders.length}</strong></article>
        <article><span>Revenue today</span><strong>{formatMoney(revenueToday)}</strong></article>
        <article><span>Pending deliveries</span><strong>{pendingDeliveries}</strong></article>
        <Link className="metric-link" to="/due-today"><span>Due today</span><strong>{dueToday}</strong></Link>
        <article><span>Pending payments</span><strong>{pendingPayments}</strong></article>
        <article><span>Delivered orders</span><strong>{deliveredOrders}</strong></article>
        <Link className="metric-link" to="/customers"><span>Total outstanding</span><strong>{formatMoney(totalOutstanding)}</strong></Link>
      </div>
      <section className="card stack">
        <div className="row between"><div><p className="eyebrow">Customer insight</p><h3>Frequent customers</h3></div><Link to="/customers">Manage accounts</Link></div>
        {frequentCustomers.length ? <div className="frequent-list">{frequentCustomers.map(({ customer, receipts }) => <div key={customer.id}><strong>{customer.name}</strong><span>{receipts} receipts</span><span className={customer.totalDue > 0 ? 'due-amount' : 'paid-amount'}>{customer.totalDue > 0 ? `${formatMoney(customer.totalDue)} due` : 'Account clear'}</span></div>)}</div> : <p className="empty-state">Frequent customers will appear here after they have two or more receipts.</p>}
      </section>
    </section>
  )
}
