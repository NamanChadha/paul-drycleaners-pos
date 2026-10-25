import type { Customer, Item, Order, Settings } from '../types/models'
import { formatDateTime } from '../utils/date'
import type { CSSProperties } from 'react'

export function ReceiptPreview({
  customer,
  order,
  items,
  settings,
}: {
  customer: Customer
  order: Order
  items: Item[]
  settings: Settings
}) {
  const parseDateParts = (isoDate?: string | null) => {
    if (!isoDate) return { day: '__', month: '__', year: '__' }
    try {
      const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate.slice(0, 10)}T00:00:00`)
      if (isNaN(d.getTime())) return { day: '__', month: '__', year: '__' }
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = String(d.getFullYear()).slice(-2)
      return { day, month, year }
    } catch {
      return { day: '__', month: '__', year: '__' }
    }
  }

  const receiptParts = parseDateParts(order.receiptDate || order.createdAt)
  const deliveryParts = parseDateParts(order.deliveryDate)
  const bookingTime = order.orderTime || '10:00 AM'
  const deliveryTime = '05:00 PM'
  const printOffset = {
    '--receipt-offset-top': `${settings.receiptOffsets.top}mm`,
    '--receipt-offset-left': `${settings.receiptOffsets.left}mm`,
  } as CSSProperties

  return (
    <>
      {/* ── SCREEN PREVIEW (full styled receipt) ── */}
      <section className="official-receipt screen-only-receipt">
        {/* Outer Border Box */}
        <div className="receipt-border-frame">
          {/* Top Header */}
          <header className="receipt-top-header">
            {/* Left: Address */}
            <div className="receipt-header-left">
              <p className="shop-address-line">100 No. Chowk,</p>
              <p className="shop-address-line">Model Town,</p>
              <p className="shop-address-city">PANIPAT - 132 103</p>
            </div>

            {/* Center: Brand Logo */}
            <div className="receipt-brand-center">
              <div className="brand-logo-container">
                <svg className="coat-hanger-icon" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 8 C47 8 45 11 47 14 C49 17 52 18 52 21 C52 24 50 25 48 25" stroke="#d81d24" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M50 25 L22 36 L18 58 L24 60 L28 42 L34 74 L66 74 L72 42 L76 60 L82 58 L78 36 Z" stroke="#d81d24" strokeWidth="2.5" strokeLinejoin="round"/>
                  <path d="M38 32 L50 52 L62 32" stroke="#d81d24" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M50 25 L47 34 L53 34 Z" fill="#d81d24"/>
                </svg>
                <div className="brand-wordmark-wrap">
                  <span className="brand-paul-text">Paul</span>
                </div>
              </div>
              <div className="brand-diamonds"><span>❖</span><span>❖</span><span>❖</span><span>❖</span><span>❖</span><span>❖</span></div>
              <div className="brand-drycleaners-text">DRYCLEANERS</div>
            </div>

            <div className="header-vertical-sep"></div>

            {/* Right: Phone Numbers */}
            <div className="receipt-header-right">
              <p className="shop-phone-no">85292-00026</p>
              <p className="shop-phone-no">98962-03343</p>
            </div>
          </header>

          {/* Receipt No & Date Row */}
          <div className="receipt-meta-strip">
            <div className="meta-receipt-no-box">
              <div className="receipt-no-label"><span>RECEIPT</span><span>NO.</span></div>
              <div className="receipt-no-val">{order.orderNumber}</div>
            </div>
            <div className="meta-date-box">
              <div className="meta-box-title">DATE OF RECEIPT</div>
              <div className="meta-date-value">
                <span className="date-slot">{receiptParts.day}</span> /{' '}
                <span className="date-slot">{receiptParts.month}</span> / 20{' '}
                <span className="date-slot">{receiptParts.year}</span>
              </div>
              <div className="meta-time-subline">At <span className="time-val">{bookingTime}</span></div>
            </div>
            <div className="meta-date-box">
              <div className="meta-box-title">DATE OF DELIVERY</div>
              <div className="meta-date-value">
                <span className="date-slot">{deliveryParts.day}</span> /{' '}
                <span className="date-slot">{deliveryParts.month}</span> / 20{' '}
                <span className="date-slot">{deliveryParts.year}</span>
              </div>
              <div className="meta-time-subline">At <span className="time-val">{deliveryTime}</span></div>
            </div>
          </div>

          {/* Customer Information Box */}
          <div className="customer-info-box">
            <div className="cust-info-row">
              <div className="cust-field name-field">
                <span className="field-label">Name :</span>
                <span className="field-value">{customer.name}</span>
                <span className="dotted-line"></span>
              </div>
              <div className="cust-field phone-field">
                <span className="field-label">Phone :</span>
                <span className="field-value">{customer.phone}</span>
                <span className="dotted-line"></span>
              </div>
            </div>
            <div className="cust-info-row full-row">
              <div className="cust-field address-field">
                <span className="field-label">Address :</span>
                <span className="field-value">{customer.address || ''}</span>
                <span className="dotted-line"></span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="receipt-table-box">
            <div className="table-header-row">
              <div className="col-particulars">PARTICULARS</div>
              <div className="col-qty">QTY.</div>
              <div className="col-amount">AMOUNT<br/>Rs.</div>
            </div>
            <div className="table-body-area">
              {items.map((item) => (
                <div key={item.id} className="table-item-row">
                  <div className="col-particulars">
                    <span className="garment-main-title">
                      {item.garmentType} <span className="service-subtext">({item.serviceType})</span>
                    </span>
                    {item.isDelivered && item.deliveredAt && (
                      <span className="item-delivered-tag">✓ Delivered {formatDateTime(item.deliveredAt)}</span>
                    )}
                  </div>
                  <div className="col-qty">{item.quantity}</div>
                  <div className="col-amount">{item.totalPrice.toFixed(2)}</div>
                </div>
              ))}
              {items.length < 5 && (
                <>
                  {Array.from({ length: 5 - items.length }).map((_, i) => (
                    <div key={`blank-${i}`} className="table-item-row blank-row">
                      <div className="col-particulars">&nbsp;</div>
                      <div className="col-qty">&nbsp;</div>
                      <div className="col-amount">&nbsp;</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Notes & Total */}
          <div className="receipt-bottom-strip">
            <div className="notes-box">
              <span className="notes-label">Notes :</span>
              <span className="notes-value">{order.notes || ''}</span>
              <span className="notes-dotted-line"></span>
            </div>
            <div className="total-amount-box">
              <div className="total-label">Total Amount</div>
              <div className="total-value">{order.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Payment summary */}
          {(order.paidAmount > 0 || order.dueAmount > 0) && (
            <div className="payment-balance-summary">
              <span>Advance Paid: <strong>{order.paidAmount.toFixed(2)}</strong></span>
              <span className="balance-due-highlight">Balance Due: <strong>{order.dueAmount.toFixed(2)}</strong></span>
              <span className="pay-status-pill">{order.dueAmount === 0 ? 'FULLY PAID' : 'PAYMENT DUE'}</span>
            </div>
          )}

          {/* Footer */}
          <footer className="receipt-footer">
            <div className="footer-left">
              <span className="thank-you-script">Thank You!</span>
              <span className="footer-pipe">|</span>
              <div className="trusted-care-block"><span>TRUSTED CARE</span><span>FOR YOUR CLOTHES</span></div>
              <div className="footer-diamonds"><span>❖</span><span>❖</span><span>❖</span></div>
            </div>
            <div className="footer-right">
              <div className="sig-dotted-line"></div>
              <span className="sig-label">Signature</span>
            </div>
          </footer>
        </div>
      </section>

      {/* ── PRINT-ONLY OVERLAY (data values only, positioned on pre-printed form) ── */}
      <div id="receipt-print-area" className="print-overlay-receipt" style={printOffset}>
        {/* Receipt Number */}
        <div className="po-receipt-no">{order.orderNumber}</div>

        {/* Date of Receipt: day / month / 20 year */}
        <div className="po-date-receipt">
          <span className="po-date-dd">{receiptParts.day}</span>
          <span className="po-date-sep">/</span>
          <span className="po-date-mm">{receiptParts.month}</span>
          <span className="po-date-sep">/</span>
          <span className="po-date-yy">{receiptParts.year}</span>
        </div>

        {/* Date of Delivery: day / month / 20 year + time */}
        <div className="po-date-delivery">
          <span className="po-date-dd">{deliveryParts.day}</span>
          <span className="po-date-sep">/</span>
          <span className="po-date-mm">{deliveryParts.month}</span>
          <span className="po-date-sep">/</span>
          <span className="po-date-yy">{deliveryParts.year}</span>
        </div>

        {/* Customer */}
        <div className="po-name">{customer.name}</div>
        <div className="po-phone">{customer.phone}</div>
        <div className="po-address">{customer.address || ''}</div>

        {/* Items */}
        <div className="po-items-area">
          {items.map((item) => (
            <div key={item.id} className="po-item-row">
              <div className="po-item-particulars">
                {item.garmentType} ({item.serviceType})
              </div>
              <div className="po-item-qty">{item.quantity}</div>
              <div className="po-item-amount">{item.totalPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Total only: notes and other pre-printed fields remain blank. */}
        <div className="po-total">{order.totalAmount.toFixed(2)}</div>
      </div>
    </>
  )
}
