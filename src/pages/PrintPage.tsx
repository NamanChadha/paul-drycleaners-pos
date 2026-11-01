import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { CheckCircle2, Printer, Download, MessageSquareCheck, CheckSquare, Square, Info, Sliders } from 'lucide-react'
import { useShopStore } from '../store/useShopStore'
import { ReceiptPreview } from '../print/ReceiptPreview'
import { formatDateTime } from '../utils/date'
import { buildWhatsAppBillUrl, buildWhatsAppDeliveryUrl } from '../utils/whatsapp'

export function PrintPage() {
  const printInProgress = useRef(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [printMode, setPrintMode] = useState<'preprinted' | 'full'>('preprinted')
  const [showGuide, setShowGuide] = useState(true)
  const location = useLocation()
  const { orderId } = useParams()
  const { orders, customers, items, settings, toggleItemDelivery } = useShopStore()
  const order = orders.find((entry) => entry.id === orderId)
  const customer = customers.find((entry) => entry.id === order?.customerId)
  const orderItems = items.filter((item) => item.orderId === orderId)
  if (!order || !customer) return <p className="card">Order not found.</p>

  const savePdf = async () => {
    const target = (printMode === 'preprinted'
      ? document.querySelector('#receipt-print-area')
      : document.querySelector('.screen-only-receipt')) as HTMLElement | null
    if (!target) return
    const canvas = await html2canvas(target, { scale: 2 })
    const pdf = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 148, 210)
    pdf.save(`receipt-${order.orderNumber}.pdf`)
  }

  const openWhatsApp = () => {
    window.open(buildWhatsAppBillUrl({ customer, order, items: orderItems, settings }), '_blank', 'noopener,noreferrer')
  }

  const sendDeliveryConfirmation = () => {
    window.open(buildWhatsAppDeliveryUrl(customer, order, settings, orderItems), '_blank', 'noopener,noreferrer')
  }

  const printReceipt = () => {
    if (printInProgress.current) return
    printInProgress.current = true
    setIsPrinting(true)
    document.body.classList.remove('print-mode-preprinted', 'print-mode-full')
    document.body.classList.add(printMode === 'preprinted' ? 'print-mode-preprinted' : 'print-mode-full')
    window.print()
    window.setTimeout(() => {
      document.body.classList.remove('print-mode-preprinted', 'print-mode-full')
      printInProgress.current = false
      setIsPrinting(false)
    }, 750)
  }

  const deliveredCount = orderItems.filter((item) => item.isDelivered).length

  return (
    <section className="stack">
      {location.state?.orderCreated && (
        <div className="success-banner">
          <CheckCircle2 size={20} /> Order #{order.orderNumber} created successfully
        </div>
      )}

      <header className="page-header">
        <div>
          <p className="eyebrow">A5 Receipt</p>
          <h2>Receipt #{order.orderNumber}</h2>
        </div>
        <div className="row">
          <button className="button primary" onClick={printReceipt} disabled={isPrinting}>
            <Printer size={16} /> {isPrinting ? 'Preparing print…' : printMode === 'preprinted' ? 'Print on Pre-Printed Pad' : 'Print Full Receipt'}
          </button>
          <button className="button" onClick={savePdf}>
            <Download size={16} /> Save PDF
          </button>
          <button className="button whatsapp" onClick={openWhatsApp}>
            <MessageSquareCheck size={16} /> WhatsApp Bill
          </button>
        </div>
      </header>

      {/* Mode Selector Bar */}
      <div className="print-mode-selector-bar">
        <div className="row" style={{ gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Receipt Paper:</span>
          <div className="mode-selector-tabs">
            <button
              type="button"
              className={`mode-tab-btn ${printMode === 'preprinted' ? 'active' : ''}`}
              onClick={() => setPrintMode('preprinted')}
            >
              📄 Pre-printed Stationery Pad
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${printMode === 'full' ? 'active' : ''}`}
              onClick={() => setPrintMode('full')}
            >
              🖨️ Plain Paper (Full Design)
            </button>
          </div>
        </div>

        {printMode === 'preprinted' && (
          <div className="row" style={{ gap: 16 }}>
            <label className="stationery-toggle-label">
              <input
                type="checkbox"
                checked={showGuide}
                onChange={(e) => setShowGuide(e.target.checked)}
              />
              <span>Show pad outline in preview</span>
            </label>
            <Link to="/settings" className="button compact-btn" title="Adjust top and left print offsets">
              <Sliders size={13} style={{ marginRight: 4 }} /> Calibrate Offsets
            </Link>
          </div>
        )}
      </div>

      {/* Print info banner */}
      <div className="print-form-tip card">
        <Info size={16} style={{ color: '#2563eb', flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>
            {printMode === 'preprinted'
              ? 'Pre-printed Stationery Mode Active (A5 Paper)'
              : 'Plain Paper Mode Active (A5 Paper)'}
          </strong>
          <p className="muted" style={{ marginTop: 3 }}>
            {printMode === 'preprinted'
              ? 'Load the pre-printed Paul Drycleaners pad in your printer. Only the dynamic details (Name, Address, Mobile, Dates, Items & Total) will be printed directly into their respective boxes. Placement coordinates can be fine-tuned in src/print/preprinted.css.'
              : 'Load blank A5 paper. The full receipt layout including logos, borders, headers, and item lines will be printed.'}
          </p>
        </div>
      </div>

      {/* Item Delivery Tracking Panel */}
      <div className="card item-delivery-panel">
        <div className="row between">
          <div>
            <h4 style={{ margin: 0 }}>Item-wise Handover / Delivery Status</h4>
            <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
              Check items as they are collected by the customer. Date & time are saved automatically.
            </p>
          </div>
          <span className="badge-pill">
            {deliveredCount} of {orderItems.length} Delivered
          </span>
        </div>

        <div className="delivery-items-checklist">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className={`delivery-check-item ${item.isDelivered ? 'is-delivered' : ''}`}
              onClick={() => toggleItemDelivery(item.id)}
            >
              <button
                type="button"
                className="delivery-toggle-btn"
                title={item.isDelivered ? 'Click to mark pending' : 'Click to mark delivered'}
              >
                {item.isDelivered ? (
                  <CheckSquare size={20} className="check-icon-done" />
                ) : (
                  <Square size={20} className="check-icon-pending" />
                )}
              </button>
              <div className="delivery-item-info">
                <strong>
                  {item.quantity} × {item.garmentType} ({item.serviceType})
                </strong>
                {item.isDelivered ? (
                  <span className="delivered-timestamp">
                    ✓ Handed over: {formatDateTime(item.deliveredAt)}
                  </span>
                ) : (
                  <span className="pending-timestamp">Pending at counter</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.status === 'delivered' && (
        <div className="delivery-action card">
          <div>
            <p className="eyebrow">Order Complete</p>
            <strong>
              {order.deliveredAt ? `Delivered: ${formatDateTime(order.deliveredAt)}` : 'Delivery recorded'}
              {order.deliveredBy ? ` (by ${order.deliveredBy})` : ''}
            </strong>
            {order.deliveryNote && <p className="muted">{order.deliveryNote}</p>}
          </div>
          <button className="button whatsapp" onClick={sendDeliveryConfirmation}>
            Send WhatsApp Confirmation
          </button>
        </div>
      )}

      {/* A5 Portrait Sheet Preview */}
      <div className="a5-preview-container">
        <ReceiptPreview
          customer={customer}
          order={order}
          items={orderItems}
          settings={settings}
          mode={printMode}
          showStationeryGuide={showGuide}
        />
      </div>
    </section>
  )
}
