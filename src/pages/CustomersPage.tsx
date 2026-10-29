import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useShopStore } from '../store/useShopStore'
import { formatDate } from '../utils/date'
import { formatMoney } from '../utils/money'
import { SALUTATIONS, type Salutation, splitCustomerTitle, combineCustomerName } from '../utils/customer'

export function CustomersPage() {
  const { customers, orders, payments, recordPayment, addOrUpdateCustomer, updateCustomer } = useShopStore()
  const [query, setQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // New customer form state
  const [newTitle, setNewTitle] = useState<Salutation>('Mr.')
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' })

  // Edit customer state
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState<Salutation>('Mr.')
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [coveredOrderIds, setCoveredOrderIds] = useState<string[]>([])

  const filtered = useMemo(() => {
    const raw = query.trim().toLowerCase()
    if (!raw) return customers
    const tokens = raw.split(/\s+/).filter(Boolean)
    return customers.filter((customer) => {
      const blob = `${customer.name} ${customer.phone} ${customer.address || ''}`.toLowerCase()
      return tokens.every((t) => blob.includes(t))
    })
  }, [customers, query])
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null
  const customerOrders = selectedCustomer
    ? orders.filter((order) => order.customerId === selectedCustomer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []
  const customerPayments = selectedCustomer ? payments.filter((payment) => payment.customerId === selectedCustomer.id) : []
  const unpaidOrders = customerOrders.filter((order) => order.dueAmount > 0)

  const openCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setIsEditing(false)
    setPaymentAmount('')
    setCoveredOrderIds(orders.filter((order) => order.customerId === customerId && order.dueAmount > 0).map((order) => order.id))
  }

  const startEdit = () => {
    if (!selectedCustomer) return
    const parsed = splitCustomerTitle(selectedCustomer.name)
    setEditTitle(parsed.title)
    setEditName(parsed.cleanName)
    setEditPhone(selectedCustomer.phone || '')
    setEditAddress(selectedCustomer.address || '')
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!selectedCustomer) return
    const finalName = combineCustomerName(editTitle, editName)
    updateCustomer(selectedCustomer.id, {
      name: finalName || selectedCustomer.name,
      phone: editPhone.trim(),
      address: editAddress.trim(),
    })
    setIsEditing(false)
  }

  const toggleOrder = (orderId: string) =>
    setCoveredOrderIds((current) => (current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]))

  const savePayment = () => {
    if (!selectedCustomer || !paymentAmount || Number(paymentAmount) <= 0 || coveredOrderIds.length === 0) return
    recordPayment({ customerId: selectedCustomer.id, amountPaid: Number(paymentAmount), ordersCovered: coveredOrderIds, paymentMethod })
    setPaymentAmount('')
  }

  const hasNewDetail = Boolean(newCustomer.name.trim() || newCustomer.phone.trim() || newCustomer.address.trim())

  const saveCustomer = () => {
    if (!hasNewDetail) return
    const phone = newCustomer.phone.replace(/\D/g, '').slice(0, 10)
    const combined = combineCustomerName(newTitle, newCustomer.name)
    const customer = addOrUpdateCustomer({ name: combined, phone, address: newCustomer.address.trim() })
    setNewCustomer({ name: '', phone: '', address: '' })
    setNewTitle('Mr.')
    openCustomer(customer.id)
  }

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Customer accounts</p>
          <h2>Customers & balances</h2>
        </div>
      </header>

      {/* Add Customer Card */}
      <div className="card customer-create">
        <div>
          <p className="eyebrow">Add customer</p>
          <h3>Save customer details</h3>
        </div>
        <div className="customer-create-fields">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Name</span>
              <span className="title-pills">
                <button
                  type="button"
                  className={`title-pill-btn ${newTitle === 'Mr.' ? 'active' : ''}`}
                  onClick={() => setNewTitle('Mr.')}
                >
                  Mr.
                </button>
                <button
                  type="button"
                  className={`title-pill-btn ${newTitle === 'Mrs.' ? 'active' : ''}`}
                  onClick={() => setNewTitle('Mrs.')}
                >
                  Mrs.
                </button>
              </span>
            </div>
            <div className="name-input-group">
              <select
                className="title-select"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value as Salutation)}
                aria-label="Prefix"
              >
                {SALUTATIONS.map((sal) => (
                  <option key={sal} value={sal}>{sal}</option>
                ))}
              </select>
              <input
                placeholder="Customer name"
                value={newCustomer.name}
                onChange={(event) => setNewCustomer((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: '#64748b' }}>Phone (optional)</div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              value={newCustomer.phone}
              onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4, fontSize: 12, color: '#64748b' }}>Address (optional)</div>
            <input
              placeholder="Locality / house no."
              value={newCustomer.address}
              onChange={(event) => setNewCustomer((current) => ({ ...current, address: event.target.value }))}
              onKeyDown={(event) => { if (event.key === 'Enter') saveCustomer() }}
            />
          </div>
          <button className="button primary" onClick={saveCustomer} disabled={!hasNewDetail}>
            Add customer
          </button>
        </div>
      </div>

      <div className="customer-workspace">
        <div className="stack">
          <input
            placeholder="Search name, phone, or address"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="customer-grid">
            {filtered.map((customer) => {
              const receiptCount = orders.filter((order) => order.customerId === customer.id).length
              return (
                <button
                  key={customer.id}
                  className={`card customer-card-button ${selectedCustomerId === customer.id ? 'selected' : ''}`}
                  onClick={() => openCustomer(customer.id)}
                >
                  <div>
                    <h3>{customer.name}</h3>
                    <p>{customer.phone || 'No phone'}{customer.address ? ` · ${customer.address}` : ''}</p>
                  </div>
                  <div className="mini-metrics">
                    <span>{receiptCount} receipts</span>
                    <span>{customer.totalDue > 0 ? 'Payment pending' : 'Settled'}</span>
                  </div>
                  <strong className={customer.totalDue > 0 ? 'due-amount' : 'paid-amount'}>
                    {formatMoney(customer.totalDue)} {customer.totalDue > 0 ? 'due' : 'clear'}
                  </strong>
                </button>
              )
            })}
          </div>
        </div>

        {selectedCustomer ? (
          <aside className="card customer-ledger stack">
            <div className="row between">
              <div>
                <p className="eyebrow">Customer ledger</p>
                <h3>{selectedCustomer.name}</h3>
                <p>
                  {selectedCustomer.phone ? `Ph: ${selectedCustomer.phone}` : 'No phone'}
                  {selectedCustomer.address ? ` · ${selectedCustomer.address}` : ''}
                </p>
              </div>
              <div className="row" style={{ gap: 8 }}>
                {!isEditing && (
                  <button type="button" className="button secondary small" onClick={startEdit}>
                    Edit profile
                  </button>
                )}
                <button className="link-button" onClick={() => { setSelectedCustomerId(null); setIsEditing(false) }}>
                  Close
                </button>
              </div>
            </div>

            {/* In-place customer profile edit */}
            {isEditing && (
              <div className="customer-edit-panel">
                <div className="row between">
                  <strong>Edit customer details</strong>
                  <button type="button" className="link-button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
                <div className="customer-edit-fields">
                  <label>
                    <span style={{ fontSize: 12 }}>Name with prefix</span>
                    <div className="name-input-group">
                      <select
                        className="title-select"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value as Salutation)}
                      >
                        {SALUTATIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                  </label>
                  <label>
                    <span style={{ fontSize: 12 }}>Phone (10 digits)</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Phone number"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </label>
                  <label>
                    <span style={{ fontSize: 12 }}>Address</span>
                    <input
                      placeholder="Address / Locality"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <button type="button" className="button primary" onClick={saveEdit}>
                      Save
                    </button>
                    <button type="button" className="button secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="ledger-balance">
              <span>Total outstanding</span>
              <strong>{formatMoney(selectedCustomer.totalDue)}</strong>
              <small>{unpaidOrders.length} receipt{unpaidOrders.length === 1 ? '' : 's'} awaiting payment</small>
            </div>

            {unpaidOrders.length > 0 && (
              <div className="payment-box">
                <strong>Record payment</strong>
                <div className="payment-fields">
                  <input
                    type="number"
                    min="1"
                    placeholder="Amount received"
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                  />
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank transfer">Bank transfer</option>
                  </select>
                  <button className="button primary" onClick={savePayment}>
                    Save payment
                  </button>
                </div>
                <small>Select the receipts this payment covers. It is applied in receipt order.</small>
              </div>
            )}

            <div className="ledger-section">
              <h3>Receipt history</h3>
              {customerOrders.map((order) => (
                <div key={order.id} className="ledger-row">
                  <label className="receipt-check">
                    <input
                      type="checkbox"
                      disabled={order.dueAmount <= 0}
                      checked={coveredOrderIds.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                    />
                  </label>
                  <div>
                    <strong>Receipt #{order.orderNumber}</strong>
                    <span>{formatDate(order.receiptDate)} · {order.status}</span>
                  </div>
                  <div>
                    <span>{formatMoney(order.totalAmount)}</span>
                    <strong className={order.dueAmount > 0 ? 'due-amount' : 'paid-amount'}>
                      {order.dueAmount > 0 ? `${formatMoney(order.dueAmount)} due` : 'Paid'}
                    </strong>
                  </div>
                  <Link to={`/orders/${order.id}/print`}>View</Link>
                </div>
              ))}
            </div>

            <div className="ledger-section">
              <h3>Payment history</h3>
              {customerPayments.length ? (
                customerPayments.map((payment) => (
                  <div key={payment.id} className="ledger-row payment-history">
                    <div>
                      <strong>{formatMoney(payment.amountPaid)}</strong>
                      <span>{payment.paymentMethod} · {new Date(payment.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <span>{payment.ordersCovered.length} receipt{payment.ordersCovered.length === 1 ? '' : 's'}</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">No payments recorded yet.</p>
              )}
            </div>
          </aside>
        ) : (
          <aside className="card customer-ledger empty-ledger">
            <p className="eyebrow">Customer ledger</p>
            <h3>Select a customer</h3>
            <p>Open any customer to see all receipts, outstanding payments, and payment history.</p>
          </aside>
        )}
      </div>
    </section>
  )
}
