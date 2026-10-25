import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { OrderQueueList } from '../components/OrderQueueList'
import { useShopStore } from '../store/useShopStore'
import { todayIso } from '../utils/date'

export function DueTodayPage() {
  const { orders } = useShopStore()
  const today = todayIso()
  const dueToday = useMemo(
    () =>
      orders
        .filter((order) => order.deliveryDate <= today && order.status !== 'delivered')
        .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.orderNumber - b.orderNumber),
    [orders, today],
  )

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Get ready today</p>
          <h2>Today’s clothes to deliver</h2>
        </div>
        <Link className="button primary" to="/orders/new">New order</Link>
      </header>
      <OrderQueueList orders={dueToday} />
    </section>
  )
}
