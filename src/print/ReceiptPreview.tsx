import type { CSSProperties } from 'react'
import type { Customer, Item, Order, Settings } from '../types/models'
import { formatDateTime } from '../utils/date'

export function ReceiptPreview({
  customer,
  order,
  items,
  settings,
  mode = 'preprinted',
  showStationeryGuide = true,
}: {
  customer: Customer
  order: Order
  items: Item[]
  settings?: Settings
  mode?: 'preprinted' | 'full'
  showStationeryGuide?: boolean
}) {
  const parseDateParts = (isoDate?: string | null) => {
    if (!isoDate) return { day: '__', month: '__', year: '____', formatted: '' }
    try {
      const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate.slice(0, 10)}T00:00:00`)
      if (isNaN(d.getTime())) return { day: '__', month: '__', year: '____', formatted: '' }
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = String(d.getFullYear())
      return { day, month, year, formatted: `${day}/${month}/${year}` }
    } catch {
      return { day: '__', month: '__', year: '____', formatted: '' }
    }
  }

  const receiptParts = parseDateParts(order.receiptDate || order.createdAt)
  const deliveryParts = parseDateParts(order.deliveryDate)
  const deliveryTime = '6:30 P.M.'

  const printOffset = {
    '--receipt-offset-top': `${settings?.receiptOffsets?.top ?? 0}mm`,
    '--receipt-offset-left': `${settings?.receiptOffsets?.left ?? 0}mm`,
  } as CSSProperties

  // Pad items to always show at least 8 rows in the full table view
  const MIN_ROWS = 8
  const blankCount = Math.max(0, MIN_ROWS - items.length)

  return (
    <>
      {/* ── 1. PRE-PRINTED STATIONERY OVERLAY (Selected by default) ── */}
      {mode === 'preprinted' && (
        <div id="receipt-print-area" className="print-overlay-receipt" style={printOffset}>
          {/* Visual guide background representing the physical pre-printed pad on screen */}
          {showStationeryGuide && (
            <div className="stationery-watermark-bg" aria-hidden="true">
              <div className="watermark-frame">
                {/* Header: Address, Paul DRYCLEANERS, Phone */}
                <div className="receipt-top-header">
                  <div className="receipt-header-left">
                    <p className="shop-address-line">100 No. Chowk,</p>
                    <p className="shop-address-line">Model Town,</p>
                    <p className="shop-address-city">PANIPAT-132 103</p>
                  </div>
                  <div className="receipt-brand-center">
                    <div className="brand-logo-container">
                      <svg className="coat-hanger-icon" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M60 6 C56 6 53 9 54 13 C55 17 59 19 59 23 C59 27 57 28 55 28" stroke="#d81d24" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                        <path d="M59 28 L35 42 L28 50 L38 54 L38 80 L82 80 L82 54 L92 50 L85 42 Z" stroke="#d81d24" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                        <path d="M50 32 L59 45 L68 32" stroke="#d81d24" strokeWidth="2" strokeLinecap="round" fill="none"/>
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
                  </div>
                  <div className="header-vertical-sep"></div>
                  <div className="receipt-header-right">
                    <p className="shop-phone-no">85292-00026</p>
                    <p className="shop-phone-no">98962-03343</p>
                  </div>
                </div>

                {/* Meta Boxes: Receipt No, Date of Receipt, Date of Delivery */}
                <div className="receipt-meta-strip">
                  <div className="meta-receipt-no-box">
                    <div className="receipt-no-label"><span>RECEIPT</span><span>NO.</span></div>
                    <div className="receipt-no-val" style={{ minWidth: 60 }}></div>
                  </div>
                  <div className="meta-date-box">
                    <div className="meta-box-title">DATE OF RECEIPT</div>
                  </div>
                  <div className="meta-date-box">
                    <div className="meta-box-title">DATE OF DELIVERY</div>
                  </div>
                </div>

                {/* Customer Info Box */}
                <div className="customer-info-box">
                  <div className="cust-info-row">
                    <div className="cust-field"><span className="field-label">Name</span></div>
                    <div className="cust-field" style={{ justifyContent: 'flex-end', paddingRight: '45mm' }}>
                      <span className="field-label">Mobile</span>
                    </div>
                  </div>
                  <div className="cust-info-row">
                    <div className="cust-field"><span className="field-label">Address</span></div>
                  </div>
                </div>

                {/* Particulars Table Frame */}
                <div className="receipt-table-box" style={{ flex: 1, minHeight: 90 }}>
                  <div className="table-header-row">
                    <div className="col-particulars">PARTICULARS</div>
                    <div className="col-qty">QTY.</div>
                    <div className="col-amount">AMOUNT (in Rs.)</div>
                  </div>
                  <div className="table-body-area"></div>
                </div>

                {/* Notes & Total */}
                <div className="receipt-bottom-strip">
                  <div className="notes-box">
                    <span className="notes-label">Notes :</span>
                  </div>
                  <div className="total-amount-box">
                    <div className="total-label">Total Amount</div>
                    <div className="total-value"></div>
                  </div>
                </div>

                {/* Footer */}
                <footer className="receipt-footer">
                  <div className="footer-left">
                    <span className="thank-you-script">Thank You!</span>
                    <span className="footer-pipe">|</span>
                    <div className="footer-center-block">
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#004b93' }}>TRUSTED CARE FOR YOUR CLOTHES</span>
                      <span style={{ color: '#d81d24', fontSize: 9 }}>❖ ❖ ❖ ❖</span>
                    </div>
                  </div>
                  <div className="footer-right">
                    <div className="sig-dotted-line"></div>
                    <span className="sig-label">Signature</span>
                  </div>
                </footer>
              </div>
            </div>
          )}

          {/* ── Dynamic Values to Print on the Stationery Pad ── */}
          <div className="po-receipt-no">{order.orderNumber}</div>
          <div className="po-date-receipt">{receiptParts.formatted}</div>
          <div className="po-date-delivery">{deliveryParts.formatted}</div>
          <div className="po-name">{customer.name}</div>
          <div className="po-mobile">{customer.phone}</div>
          <div className="po-address">{customer.address || ''}</div>

          <div className="po-items-area">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="po-item-row"
                style={{ top: `calc(${idx} * var(--po-item-row-height))` }}
              >
                <div className="po-item-particulars">
                  {item.garmentType} <span className="po-item-service">({item.serviceType})</span>
                </div>
                <div className="po-item-qty">{item.quantity}</div>
                <div className="po-item-amount">{item.totalPrice.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {order.notes && <div className="po-notes">{order.notes}</div>}
          <div className="po-total">{order.totalAmount.toFixed(2)}</div>
        </div>
      )}

      {/* ── 2. FULL RECEIPT (FOR PLAIN PAPER OR FULL PDF) ── */}
      {mode === 'full' && (
        <section className="official-receipt screen-only-receipt">
          <div className="receipt-border-frame">
            {/* Top Header */}
            <header className="receipt-top-header">
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

              <div className="receipt-brand-center">
                <div className="brand-logo-container">
                  <svg className="coat-hanger-icon" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 6 C56 6 53 9 54 13 C55 17 59 19 59 23 C59 27 57 28 55 28" stroke="#d81d24" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M59 28 L35 42 L28 50 L38 54 L38 80 L82 80 L82 54 L92 50 L85 42 Z" stroke="#d81d24" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                    <path d="M50 32 L59 45 L68 32" stroke="#d81d24" strokeWidth="2" strokeLinecap="round" fill="none"/>
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
              </div>

              <div className="header-vertical-sep"></div>

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

            {/* Meta Strip */}
            <div className="receipt-meta-strip">
              <div className="meta-receipt-no-box">
                <div className="receipt-no-label"><span>RECEIPT</span><span>NO.</span></div>
                <div className="receipt-no-val">{order.orderNumber}</div>
              </div>

              <div className="meta-date-box">
                <div className="meta-box-header">
                  <span className="meta-box-title">DATE OF RECEIPT</span>
                </div>
                <div className="meta-date-value">
                  <span className="date-slot">{receiptParts.day}</span> /{' '}
                  <span className="date-slot">{receiptParts.month}</span> / 20{' '}
                  <span className="date-slot">{receiptParts.year.slice(-2)}</span>
                </div>
              </div>

              <div className="meta-date-box meta-delivery-box">
                <div className="meta-box-header">
                  <span className="meta-box-title">DATE OF DELIVERY</span>
                </div>
                <div className="meta-date-value">
                  <span className="date-slot">{deliveryParts.day}</span> /{' '}
                  <span className="date-slot">{deliveryParts.month}</span> / 20{' '}
                  <span className="date-slot">{deliveryParts.year.slice(-2)}</span>
                </div>
                <div className="meta-time-subline">
                  At <span className="time-val">{deliveryTime}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="customer-info-box">
              <div className="cust-info-row">
                <div className="cust-field name-field">
                  <span className="field-label">Name :</span>
                  <span className="field-value">{customer.name}</span>
                  <span className="dotted-line"></span>
                </div>
                <div className="cust-field phone-field">
                  <span className="field-label">Mobile :</span>
                  <span className="field-value">{customer.phone}</span>
                  <span className="dotted-line"></span>
                </div>
              </div>
              <div className="cust-info-row full-row">
                <div className="cust-field address-field-receipt">
                  <span className="field-label">Address :</span>
                  <span className="field-value">{customer.address || ''}</span>
                  <span className="dotted-line"></span>
                </div>
              </div>
            </div>

            {/* Particulars Table */}
            <div className="receipt-table-box">
              <div className="table-header-row">
                <div className="col-particulars">PARTICULARS</div>
                <div className="col-qty">QTY.</div>
                <div className="col-amount">AMOUNT (in Rs.)</div>
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

            {/* Payment balance summary */}
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
                <div className="footer-center-block">
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
      )}
    </>
  )
}
