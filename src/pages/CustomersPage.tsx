import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useShopStore } from '../store/useShopStore'
import { formatDate } from '../utils/date'
import { formatMoney } from '../utils/money'

export function CustomersPage() {
  const { customers, orders, payments, recordPayment, addOrUpdateCustomer } = useShopStore()
  const [query, setQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' })
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [coveredOrderIds, setCoveredOrderIds] = useState<string[]>([])

  const filtered = useMemo(
    () => customers.filter((customer) => `${customer.name} ${customer.phone}`.toLowerCase().includes(query.toLowerCase())),
    [customers, query],
  )
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null
  const customerOrders = selectedCustomer
    ? orders.filter((order) => order.customerId === selectedCustomer.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []
  const customerPayments = selectedCustomer ? payments.filter((payment) => payment.customerId === selectedCustomer.id) : []
  const unpaidOrders = customerOrders.filter((order) => order.dueAmount > 0)

  const openCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setPaymentAmount('')
    setCoveredOrderIds(orders.filter((order) => order.customerId === customerId && order.dueAmount > 0).map((order) => order.id))
  }
  const toggleOrder = (orderId: string) => setCoveredOrderIds((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId])
  const savePayment = () => {
    if (!selectedCustomer || !paymentAmount || Number(paymentAmount) <= 0 || coveredOrderIds.length === 0) return
    recordPayment({ customerId: selectedCustomer.id, amountPaid: Number(paymentAmount), ordersCovered: coveredOrderIds, paymentMethod })
    setPaymentAmount('')
  }
  const saveCustomer = () => {
    const phone = newCustomer.phone.replace(/\D/g, '').slice(0, 10)
    if (!newCustomer.name.trim() || !/^[6-9]\d{9}$/.test(phone)) return
    const customer = addOrUpdateCustomer({ name: newCustomer.name.trim(), phone, address: newCustomer.address.trim() })
    setNewCustomer({ name: '', phone: '', address: '' })
    openCustomer(customer.id)
  }

  return (
    <section className="stack">
      <header className="page-header"><div><p className="eyebrow">Customer accounts</p><h2>Customers & balances</h2></div></header>
      <div className="card customer-create">
        <div><p className="eyebrow">Add customer</p><h3>Save customer details</h3></div>
        <div className="customer-create-fields">
          <input placeholder="Customer name" value={newCustomer.name} onChange={(event) => setNewCustomer((current) => ({ ...current, name: event.target.value }))} />
          <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={newCustomer.phone} onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} />
          <input placeholder="Address (optional)" value={newCustomer.address} onChange={(event) => setNewCustomer((current) => ({ ...current, address: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') saveCustomer() }} />
          <button className="button primary" onClick={saveCustomer} disabled={!newCustomer.name.trim() || !/^[6-9]\d{9}$/.test(newCustomer.phone)}>Add customer</button>
        </div>
      </div>
      <div className="customer-workspace">
        <div className="stack">
          <input placeholder="Search name or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="customer-grid">
            {filtered.map((customer) => {
              const receiptCount = orders.filter((order) => order.customerId === customer.id).length
              return <button key={customer.id} className={`card customer-card-button ${selectedCustomerId === customer.id ? 'selected' : ''}`} onClick={() => openCustomer(customer.id)}>
                <div><h3>{customer.name}</h3><p>{customer.phone}</p></div>
                <div className="mini-metrics"><span>{receiptCount} receipts</span><span>{customer.totalDue > 0 ? 'Payment pending' : 'Settled'}</span></div>
                <strong className={customer.totalDue > 0 ? 'due-amount' : 'paid-amount'}>{formatMoney(customer.totalDue)} {customer.totalDue > 0 ? 'due' : 'clear'}</strong>
              </button>
            })}
          </div>
        </div>

        {selectedCustomer ? <aside className="card customer-ledger stack">
          <div className="row between"><div><p className="eyebrow">Customer ledger</p><h3>{selectedCustomer.name}</h3><p>{selectedCustomer.phone}{selectedCustomer.address ? ` · ${selectedCustomer.address}` : ''}</p></div><button className="link-button" onClick={() => setSelectedCustomerId(null)}>Close</button></div>
          <div className="ledger-balance"><span>Total outstanding</span><strong>{formatMoney(selectedCustomer.totalDue)}</strong><small>{unpaidOrders.length} receipt{unpaidOrders.length === 1 ? '' : 's'} awaiting payment</small></div>
          {unpaidOrders.length > 0 && <div className="payment-box"><strong>Record payment</strong><div className="payment-fields"><input type="number" min="1" placeholder="Amount received" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="cash">Cash</option><option value="UPI">UPI</option><option value="card">Card</option><option value="bank transfer">Bank transfer</option></select><button className="button primary" onClick={savePayment}>Save payment</button></div><small>Select the receipts this payment covers. It is applied in receipt order.</small></div>}
          <div className="ledger-section"><h3>Receipt history</h3>{customerOrders.map((order) => <div key={order.id} className="ledger-row"><label className="receipt-check"><input type="checkbox" disabled={order.dueAmount <= 0} checked={coveredOrderIds.includes(order.id)} onChange={() => toggleOrder(order.id)} /></label><div><strong>Receipt #{order.orderNumber}</strong><span>{formatDate(order.receiptDate)} · {order.status}</span></div><div><span>{formatMoney(order.totalAmount)}</span><strong className={order.dueAmount > 0 ? 'due-amount' : 'paid-amount'}>{order.dueAmount > 0 ? `${formatMoney(order.dueAmount)} due` : 'Paid'}</strong></div><Link to={`/orders/${order.id}/print`}>View</Link></div>)}</div>
          <div className="ledger-section"><h3>Payment history</h3>{customerPayments.length ? customerPayments.map((payment) => <div key={payment.id} className="ledger-row payment-history"><div><strong>{formatMoney(payment.amountPaid)}</strong><span>{payment.paymentMethod} · {new Date(payment.createdAt).toLocaleDateString('en-IN')}</span></div><span>{payment.ordersCovered.length} receipt{payment.ordersCovered.length === 1 ? '' : 's'}</span></div>) : <p className="empty-state">No payments recorded yet.</p>}</div>
        </aside> : <aside className="card customer-ledger empty-ledger"><p className="eyebrow">Customer ledger</p><h3>Select a customer</h3><p>Open any customer to see all receipts, outstanding payments, and payment history.</p></aside>}
      </div>
    </section>
  )
}
