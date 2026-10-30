import { useMemo } from 'react'
import { OrderQueueList } from '../components/OrderQueueList'
import { useShopStore } from '../store/useShopStore'

export function UndeliveredPage() {
  const { orders } = useShopStore()
  const undelivered = useMemo(
    () =>
      orders
        .filter((order) => order.status !== 'delivered' && order.status !== 'cancelled')
        .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.orderNumber - b.orderNumber),
    [orders],
  )

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Open work</p>
          <h2>All orders not delivered</h2>
        </div>
      </header>
      <OrderQueueList orders={undelivered} />
    </section>
  )
}
