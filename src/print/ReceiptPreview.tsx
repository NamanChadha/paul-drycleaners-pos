import type { Customer, Item, Order, Settings } from '../types/models'
import { formatDateTime } from '../utils/date'

export function ReceiptPreview({
  customer,
  order,
  items,
}: {
  customer: Customer
  order: Order
  items: Item[]
  settings?: Settings
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
  const deliveryTime = '6:30 P.M.'

  // Pad items to always show at least 8 rows in the table
  const MIN_ROWS = 8
  const blankCount = Math.max(0, MIN_ROWS - items.length)

  return (
    <>
      {/* ── SCREEN / PRINT PREVIEW (full styled A5 receipt) ── */}
      <section className="official-receipt screen-only-receipt">
        <div className="receipt-border-frame">

          {/* ── TOP HEADER ── */}
          <header className="receipt-top-header">
            {/* Left: Address with pin icon */}
            <div className="receipt-header-left">
              <div className="header-address-row">
                <svg className="header-pin-icon" viewBox="0 0 24 24" fill="#004b93" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <p className="shop-address-line">100 No. Chowk,</p>
                  <p className="shop-address-line">Model Town,</p>
                  <p className="shop-address-city">PANIPAT - 132 103</p>
                </div>
              </div>
            </div>

            {/* Center: Brand Logo */}
            <div className="receipt-brand-center">
              <div className="brand-logo-container">
                {/* Coat hanger SVG matching the image */}
                <svg className="coat-hanger-icon" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Hanger hook */}
                  <path d="M60 6 C56 6 53 9 54 13 C55 17 59 19 59 23 C59 27 57 28 55 28" stroke="#d81d24" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  {/* Shirt body outline */}
                  <path d="M59 28 L35 42 L28 50 L38 54 L38 80 L82 80 L82 54 L92 50 L85 42 Z" stroke="#d81d24" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                  {/* Collar */}
                  <path d="M50 32 L59 45 L68 32" stroke="#d81d24" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  {/* Buttons */}
                  <circle cx="60" cy="52" r="1.5" fill="#d81d24"/>
                  <circle cx="60" cy="60" r="1.5" fill="#d81d24"/>
                  <circle cx="60" cy="68" r="1.5" fill="#d81d24"/>
                </svg>
                <div className="brand-wordmark-wrap">
                  <span className="brand-paul-text">Paul</span>
                </div>
              </div>
              <div className="brand-diamonds"><span>❖</span><span>❖</span><span>❖</span><span>❖</span><span>❖</span><span>❖</span></div>
              <div className="brand-drycleaners-text">DRYCLEANERS</div>
              <div className="brand-since-text">— SINCE 1970 —</div>
            </div>

            <div className="header-vertical-sep"></div>

            {/* Right: Phone with phone icon */}
            <div className="receipt-header-right">
              <div className="header-phone-row">
                <svg className="header-phone-icon" viewBox="0 0 24 24" fill="#004b93" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <div>
                  <p className="shop-phone-no">85292-00026</p>
                  <p className="shop-phone-no">98962-03343</p>
                </div>
              </div>
            </div>
          </header>

          {/* ── META STRIP: Receipt No, Date of Receipt, Date of Delivery ── */}
          <div className="receipt-meta-strip">
            <div className="meta-receipt-no-box">
              <div className="receipt-no-label"><span>RECEIPT</span><span>NO.</span></div>
              <div className="receipt-no-val">{order.orderNumber}</div>
            </div>

            <div className="meta-date-box">
              <div className="meta-box-header">
                <svg viewBox="0 0 24 24" fill="#004b93" width="12" height="12"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                <span className="meta-box-title">DATE OF RECEIPT</span>
              </div>
              <div className="meta-date-value">
                <span className="date-slot">{receiptParts.day}</span> /{' '}
                <span className="date-slot">{receiptParts.month}</span> / 20{' '}
                <span className="date-slot">{receiptParts.year}</span>
              </div>
            </div>

            <div className="meta-date-box meta-delivery-box">
              <div className="meta-box-header">
                <svg viewBox="0 0 24 24" fill="#004b93" width="13" height="13"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                <span className="meta-box-title">DATE OF DELIVERY</span>
              </div>
              <div className="meta-date-value">
                <span className="date-slot">{deliveryParts.day}</span> /{' '}
                <span className="date-slot">{deliveryParts.month}</span> / 20{' '}
                <span className="date-slot">{deliveryParts.year}</span>
              </div>
              <div className="meta-time-subline">
                <svg viewBox="0 0 24 24" fill="#004b93" width="10" height="10" style={{marginRight:2}}><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                At <span className="time-val">{deliveryTime}</span>
              </div>
            </div>
          </div>

          {/* ── CUSTOMER INFO ── */}
          <div className="customer-info-box">
            <div className="cust-info-row">
              <div className="cust-field name-field">
                <svg viewBox="0 0 24 24" fill="#004b93" width="13" height="13"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span className="field-label">Name :</span>
                <span className="field-value">{customer.name}</span>
                <span className="dotted-line"></span>
              </div>
              <div className="cust-field phone-field">
                <svg viewBox="0 0 24 24" fill="#004b93" width="13" height="13"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                <span className="field-label">Phone :</span>
                <span className="field-value">{customer.phone}</span>
                <span className="dotted-line"></span>
              </div>
            </div>
            <div className="cust-info-row full-row">
              <div className="cust-field address-field-receipt">
                <svg viewBox="0 0 24 24" fill="#004b93" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <span className="field-label">Address :</span>
                <span className="field-value">{customer.address || ''}</span>
                <span className="dotted-line"></span>
              </div>
            </div>
          </div>

          {/* ── PARTICULARS TABLE ── */}
          <div className="receipt-table-box">
            <div className="table-header-row">
              <div className="col-particulars">
                <svg viewBox="0 0 24 24" fill="#004b93" width="13" height="13" style={{marginRight:5}}><path d="M6.5 10h-2v7h2v-7zm6 0h-2v7h2v-7zm8.5 9H2v2h19v-2zm-2.5-9h-2v7h2v-7zM11.5 1L2 6v2h19V6l-9.5-5z"/></svg>
                PARTICULARS
              </div>
              <div className="col-qty">
                <svg viewBox="0 0 24 24" fill="#004b93" width="12" height="12" style={{marginRight:3}}><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.73 0 13.09 0c-1.5 0-2.84.64-3.82 1.65L8 3 6.73 1.65C5.75.64 4.41 0 2.91 0 .27 0-1.28 2.06-1.28 4.64c0 .48.11.92.18 1.36H-2v14h22V6zm-9.82-2.99C10.73 2.38 11.37 2 12 2c.63 0 1.27.38 1.82.99L15 4.5H9l1.18-1.49zM5.73 2.99C6.28 2.38 6.92 2 7.55 2c.63 0 1.27.38 1.82.99L10.55 4.5H4.55L5.73 2.99zM18 18H6V8h12v10z"/></svg>
                QTY.
              </div>
              <div className="col-amount">
                <span style={{fontSize:'11px'}}>₹</span><br/>AMOUNT<br/>RS.
              </div>
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
              {blankCount > 0 && Array.from({ length: blankCount }).map((_, i) => (
                <div key={`blank-${i}`} className="table-item-row blank-row">
                  <div className="col-particulars">&nbsp;</div>
                  <div className="col-qty">&nbsp;</div>
                  <div className="col-amount">&nbsp;</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── NOTES & TOTAL ── */}
          <div className="receipt-bottom-strip">
            <div className="notes-box">
              <svg viewBox="0 0 24 24" fill="#004b93" width="13" height="13" style={{flexShrink:0}}><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              <span className="notes-label">Notes :</span>
              <span className="notes-value">{order.notes || ''}</span>
              <span className="notes-dotted-line"></span>
            </div>
            <div className="total-amount-box">
              <div className="total-label">Total Amount</div>
              <div className="total-value">{order.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Payment balance summary (if applicable) */}
          {(order.paidAmount > 0 || order.dueAmount > 0) && (
            <div className="payment-balance-summary">
              <span>Advance Paid: <strong>{order.paidAmount.toFixed(2)}</strong></span>
              <span className="balance-due-highlight">Balance Due: <strong>{order.dueAmount.toFixed(2)}</strong></span>
              <span className="pay-status-pill">{order.dueAmount === 0 ? 'FULLY PAID' : 'PAYMENT DUE'}</span>
            </div>
          )}

          {/* ── FOOTER ── */}
          <footer className="receipt-footer">
            <div className="footer-left">
              <span className="thank-you-script">Thank You!</span>
              <span className="footer-pipe">|</span>
              <div className="footer-center-block">
                <svg className="footer-shirt-icon" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 5 L28 18 L10 12 L2 30 L16 34 L16 65 L64 65 L64 34 L78 30 L70 12 L52 18 Z" stroke="#004b93" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                  <path d="M28 18 L40 32 L52 18" stroke="#004b93" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <circle cx="40" cy="42" r="2" fill="#d81d24"/>
                  <circle cx="40" cy="52" r="2" fill="#d81d24"/>
                </svg>
                <div className="trusted-care-block"><span>TRUSTED CARE</span><span>FOR YOUR CLOTHES</span></div>
                <div className="footer-diamonds"><span>❖</span><span>❖</span><span>❖</span><span>❖</span></div>
              </div>
            </div>
            <div className="footer-right">
              <div className="sig-dotted-line"></div>
              <span className="sig-label">Signature</span>
            </div>
          </footer>

        </div>
      </section>
    </>
  )
}
