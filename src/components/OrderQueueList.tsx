import { Link } from 'react-router-dom'
import { CheckSquare, Square, Printer, MessageSquare, CheckCircle2 } from 'lucide-react'
import { useShopStore } from '../store/useShopStore'
import type { Order } from '../types/models'
import { formatDate, formatDateTime } from '../utils/date'
import { formatMoney } from '../utils/money'
import { buildWhatsAppBillUrl, buildWhatsAppDeliveryUrl } from '../utils/whatsapp'

export function OrderQueueList({ orders }: { orders: Order[] }) {
  const { customers, items, settings, updateOrderStatus, toggleItemDelivery } = useShopStore()

  const changeStatus = (orderId: string, nextStatus: Order['status']) => {
    if (nextStatus !== 'delivered') return updateOrderStatus(orderId, nextStatus)
    const deliveredBy = window.prompt('Who handed over the clothes? (staff name)', 'Counter Staff')
    if (deliveredBy === null) return
    const deliveryNote = window.prompt('Optional delivery note or customer signature name') ?? ''
    updateOrderStatus(orderId, nextStatus, { deliveredBy, deliveryNote })
  }

  if (orders.length === 0) {
    return <div className="card empty-state">No orders here right now.</div>
  }

  return (
    <div className="queue-list">
      {orders.map((order) => {
        const customer = customers.find((entry) => entry.id === order.customerId)
        const orderItems = items.filter((item) => item.orderId === order.id)
        if (!customer) return null

        const deliveredCount = orderItems.filter((item) => item.isDelivered).length
        const bookingTimeDisplay = order.orderTime
          ? `${formatDate(order.receiptDate)} · ${order.orderTime}`
          : formatDateTime(order.createdAt)

        return (
          <article key={order.id} className="card queue-card">
            <div className="queue-header-info">
              <span className="order-number-badge">#{order.orderNumber}</span>
              <div>
                <h3 style={{ margin: 0 }}>{customer.name}</h3>
                <p className="muted" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
                  {customer.phone} · Booked: <strong>{bookingTimeDisplay}</strong>
                </p>
              </div>
            </div>

            <div className="queue-items-checklist">
              <div className="queue-items-title">
                <span>Items ({deliveredCount}/{orderItems.length} delivered)</span>
                <span className="muted" style={{ fontSize: '11px' }}>Click item to mark delivered</span>
              </div>
              <div className="queue-items-scroll">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className={`queue-item-pill ${item.isDelivered ? 'is-done' : ''}`}
                    onClick={() => toggleItemDelivery(item.id)}
                    title={item.isDelivered ? 'Marked delivered. Click to unmark.' : 'Click to mark delivered'}
                  >
                    <button type="button" className="queue-item-check-btn">
                      {item.isDelivered ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <div className="queue-item-text">
                      <span>{item.quantity} × {item.garmentType} ({item.serviceType})</span>
                      {item.isDelivered && item.deliveredAt && (
                        <span className="queue-delivered-time">
                          ✓ {formatDateTime(item.deliveredAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="queue-dates">
              <div>
                <span className="muted">Due Date:</span>
                <strong>{formatDate(order.deliveryDate)}</strong>
              </div>
              {order.status === 'delivered' && order.deliveredAt && (
                <div className="delivered-timestamp-badge" style={{ marginTop: '4px' }}>
                  <CheckCircle2 size={12} /> Delivered: {formatDateTime(order.deliveredAt)}
                </div>
              )}
            </div>

            <div className="queue-due">
              <span className="muted">Due Balance:</span>
              <strong style={{ color: order.dueAmount > 0 ? '#b91c1c' : '#166534' }}>
                {formatMoney(order.dueAmount)}
              </strong>
            </div>

            <div className="queue-status-wrap">
              <select
                value={order.status}
                className={`status-pill status-${order.status}`}
                onChange={(event) => changeStatus(order.id, event.target.value as typeof order.status)}
              >
                <option value="pending">Pending</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="queue-actions">
              <Link className="button" to={`/orders/${order.id}/print`}>
                <Printer size={15} /> Print
              </Link>
              <button
                className="button whatsapp"
                onClick={() =>
                  window.open(buildWhatsAppBillUrl({ customer, order, items: orderItems, settings }), '_blank', 'noopener,noreferrer')
                }
              >
                <MessageSquare size={15} /> Bill
              </button>
              {order.status === 'delivered' && (
                <button
                  className="button whatsapp"
                  onClick={() =>
                    window.open(buildWhatsAppDeliveryUrl(customer, order, settings), '_blank', 'noopener,noreferrer')
                  }
                >
                  Confirm Delivery
                </button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
