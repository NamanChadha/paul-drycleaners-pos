import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { CheckSquare, Square, ChevronDown, ChevronUp, Printer, MessageSquare, CheckCircle2 } from 'lucide-react'
import { useShopStore } from '../store/useShopStore'
import { formatDate, formatDateTime } from '../utils/date'
import { formatMoney } from '../utils/money'
import { buildWhatsAppDeliveryUrl } from '../utils/whatsapp'

export function OrdersPage() {
  const { orders, customers, items, settings, updateOrderStatus, toggleItemDelivery, recordPayment } = useShopStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const customer = customers.find((entry) => entry.id === order.customerId)
        const text = `${order.orderNumber} ${customer?.name ?? ''} ${customer?.phone ?? ''}`.toLowerCase()
        return text.includes(query.toLowerCase()) && (status === 'all' || order.status === status)
      }),
    [orders, customers, query, status],
  )

  const changeStatus = (orderId: string, nextStatus: 'pending' | 'ready' | 'delivered') => {
    if (nextStatus !== 'delivered') return updateOrderStatus(orderId, nextStatus)
    const deliveredBy = window.prompt('Staff name handling delivery:', 'Counter Staff')
    if (deliveredBy === null) return
    const deliveryNote = window.prompt('Optional delivery note / customer signature name:') ?? ''
    updateOrderStatus(orderId, nextStatus, { deliveredBy, deliveryNote })
  }

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Search & Handover</p>
          <h2>Orders</h2>
        </div>
        <Link className="button primary" to="/orders/new">
          + New Order
        </Link>
      </header>

      <div className="toolbar">
        <input
          placeholder="Search by order #, customer name, or phone..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <div className="orders-cards-list">
        {filtered.length === 0 ? (
          <div className="card empty-state">No matching orders found.</div>
        ) : (
          filtered.map((order) => {
            const customer = customers.find((entry) => entry.id === order.customerId)
            const orderItems = items.filter((item) => item.orderId === order.id)
            const deliveredCount = orderItems.filter((item) => item.isDelivered).length
            const isExpanded = expandedOrders[order.id] ?? true // default expanded for easy one-click handover

            const bookingTimeDisplay = order.orderTime
              ? `${formatDate(order.receiptDate)} · ${order.orderTime}`
              : formatDateTime(order.createdAt)

            return (
              <article key={order.id} className="card order-master-card">
                <div className="order-main-row">
                  <div className="order-header-info">
                    <span className="order-number-badge">#{order.orderNumber}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px' }}>{customer?.name || 'Walk-in Customer'}</h3>
                      <p className="muted" style={{ margin: '2px 0 0 0', fontSize: '13px' }}>
                        {customer?.phone} · Booked: <strong>{bookingTimeDisplay}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="order-dates-info">
                    <div>
                      <span className="muted">Due Date:</span>{' '}
                      <strong>{formatDate(order.deliveryDate)}</strong>
                    </div>
                    {order.status === 'delivered' && order.deliveredAt && (
                      <div className="delivered-timestamp-badge">
                        <CheckCircle2 size={13} /> Delivered: {formatDateTime(order.deliveredAt)}
                      </div>
                    )}
                  </div>

                  <div className="order-money-info">
                    <div>
                      <span className="muted">Total:</span> <strong>{formatMoney(order.totalAmount)}</strong>
                    </div>
                    <div style={{ color: order.dueAmount > 0 ? '#b91c1c' : '#166534', fontWeight: 650 }}>
                      {order.dueAmount > 0 ? `Due: ${formatMoney(order.dueAmount)}` : 'Paid in full'}
                    </div>
                  </div>

                  <div className="order-status-select-wrap">
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

                  <div className="order-row-actions">
                    <Link className="button" to={`/orders/${order.id}/print`}>
                      <Printer size={15} /> Receipt
                    </Link>
                    {customer && (
                      <button
                        className="button whatsapp compact-btn"
                        onClick={() =>
                          window.open(buildWhatsAppDeliveryUrl(customer, order, settings), '_blank', 'noopener,noreferrer')
                        }
                      >
                        <MessageSquare size={15} /> WhatsApp
                      </button>
                    )}
                    {order.dueAmount > 0 && (
                      <button
                        className="button compact-pay"
                        onClick={() => {
                          recordPayment({
                            customerId: order.customerId,
                            amountPaid: order.dueAmount,
                            ordersCovered: [order.id],
                            paymentMethod: 'cash',
                          })
                        }}
                      >
                        Pay Due
                      </button>
                    )}
                    <button
                      type="button"
                      className="button icon-only-btn"
                      onClick={() => toggleExpand(order.id)}
                      title={isExpanded ? 'Collapse items' : 'Expand items'}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Item-wise Delivery Checkpoints */}
                {isExpanded && (
                  <div className="order-items-delivery-box">
                    <div className="items-box-header">
                      <span>
                        Garments in Order ({deliveredCount}/{orderItems.length} delivered)
                      </span>
                      <span className="muted" style={{ fontSize: '12px' }}>
                        Click any item checkbox below to mark it delivered early with timestamp
                      </span>
                    </div>

                    <div className="items-checklist-grid">
                      {orderItems.map((item) => (
                        <div
                          key={item.id}
                          className={`item-handover-pill ${item.isDelivered ? 'item-done' : 'item-pending'}`}
                          onClick={() => toggleItemDelivery(item.id)}
                        >
                          <button
                            type="button"
                            className="item-check-btn"
                            title={item.isDelivered ? 'Click to unmark' : 'Click to deliver item'}
                          >
                            {item.isDelivered ? (
                              <CheckSquare size={18} className="check-done-icon" />
                            ) : (
                              <Square size={18} className="check-pending-icon" />
                            )}
                          </button>
                          <div className="item-handover-details">
                            <span className="item-title">
                              {item.quantity} × {item.garmentType} ({item.serviceType}) — {formatMoney(item.totalPrice)}
                            </span>
                            {item.isDelivered ? (
                              <span className="item-delivery-time">
                                ✓ Handed Over: {formatDateTime(item.deliveredAt)}
                              </span>
                            ) : (
                              <span className="item-pending-text">Click to mark delivered</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
