import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateDeliveryDate } from '../utils/date'
import { formatMoney } from '../utils/money'
import { useShopStore } from '../store/useShopStore'

type DraftItem = {
  garmentType: string
  serviceType: string
  quantity: number
  unitPrice: number
}

export function NewOrderPage() {
  const navigate = useNavigate()
  const { customers, settings, createOrder } = useShopStore()
  const getDefaultPrice = (garmentType: string) => settings.garmentPrices?.[garmentType] ?? 0
  const defaultService = settings.serviceTypes.includes('Dryclean') ? 'Dryclean' : settings.serviceTypes[0] ?? ''
  const makeItem = (): DraftItem => ({
    garmentType: settings.garmentTypes[0] ?? '',
    serviceType: defaultService,
    quantity: 1,
    unitPrice: getDefaultPrice(settings.garmentTypes[0] ?? ''),
  })

  const [phone, setPhone] = useState('')
  const normalizedPhone = phone.replace(/\D/g, '')
  const hasValidPhone = /^[6-9]\d{9}$/.test(normalizedPhone)
  const matchedCustomer = customers.find((customer) => customer.phone.replace(/\D/g, '') === normalizedPhone)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(
    calculateDeliveryDate(settings.deliveryOffsetDays, settings.sundayClosed),
  )
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftItem[]>([makeItem()])

  const phoneRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const garmentRefs = useRef<Array<HTMLSelectElement | null>>([])
  const serviceRefs = useRef<Array<HTMLSelectElement | null>>([])
  const quantityRefs = useRef<Array<HTMLInputElement | null>>([])
  const priceRefs = useRef<Array<HTMLInputElement | null>>([])

  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items])

  const updateItem = (index: number, patch: Partial<DraftItem>) =>
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))

  const addItem = (focus = true) => {
    setItems((current) => [...current, makeItem()])
    if (focus) window.setTimeout(() => garmentRefs.current[items.length]?.focus(), 0)
  }

  const removeItem = (index: number) =>
    setItems((current) => (current.length === 1 ? [makeItem()] : current.filter((_, itemIndex) => itemIndex !== index)))

  const nextOnEnter = (event: KeyboardEvent, next?: () => void) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    next?.()
  }

  const submit = () => {
    if (!hasValidPhone) return
    const order = createOrder({
      customer: {
        name: matchedCustomer?.name || name,
        phone,
        address: matchedCustomer?.address || address,
      },
      deliveryDate,
      paidAmount,
      notes,
      items,
    })
    navigate(`/orders/${order.id}/print`, { state: { orderCreated: true } })
  }

  return (
    <section className="new-order-shell">
      <div className="new-order-main stack compact-stack">
        <header className="page-header">
          <div><p className="eyebrow">Counter flow</p><h2>New order</h2></div>
        </header>

        <div className="card compact-card customer-card">
          {matchedCustomer && (
            <div className="returning-customer" role="status">
              <span>✓</span> Returning customer found — details loaded{matchedCustomer.totalDue > 0 ? ` · ${formatMoney(matchedCustomer.totalDue)} outstanding` : ''}
            </div>
          )}
          <div className="compact-form-grid">
            <label>
              Phone
              <input
                ref={phoneRef}
                autoFocus
                type="tel"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={phone.length > 0 && !hasValidPhone}
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(event) => nextOnEnter(event, () => nameRef.current?.focus())}
              />
              {phone.length > 0 && !hasValidPhone && <small className="field-error">Enter a valid 10-digit mobile number.</small>}
            </label>
            <label>
              Name
              <input
                ref={nameRef}
                value={matchedCustomer?.name || name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => nextOnEnter(event, () => addressRef.current?.focus())}
              />
            </label>
            <label className="address-field">
              Address
              <input
                ref={addressRef}
                value={matchedCustomer?.address || address}
                onChange={(event) => setAddress(event.target.value)}
                onKeyDown={(event) => nextOnEnter(event, () => garmentRefs.current[0]?.focus())}
              />
            </label>
            <label>Delivery date<input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
            <label>Paid now<input type="number" value={paidAmount} onChange={(event) => setPaidAmount(Number(event.target.value))} /></label>
            <label className="address-field">Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          </div>
        </div>

        <div className="card items-card stack compact-stack">
          <div className="row between">
            <div>
              <p className="eyebrow">Fast entry</p>
              <h3>Items</h3>
            </div>
            <div className="row">
              <button className="button primary add-item-button" onClick={() => addItem()}>Add item</button>
            </div>
          </div>

          <div className="quick-garments">
            {settings.quickAddItems.filter((garment) => settings.garmentTypes.includes(garment)).map((garment) => (
              <button
                key={garment}
                className="chip"
                onClick={() => {
                  const index = items.length - 1
                  updateItem(index, { garmentType: garment, unitPrice: getDefaultPrice(garment) })
                  serviceRefs.current[index]?.focus()
                }}
              >
                {garment}
              </button>
            ))}
          </div>

          <div className="item-table-head">
            <span>Garment</span><span>Service</span><span>Qty</span><span>Price</span><span>Total</span><span />
          </div>

          {items.map((item, index) => (
            <div key={index} className="fast-item-row">
              <select
                ref={(node) => { garmentRefs.current[index] = node }}
                value={item.garmentType}
                onChange={(event) => updateItem(index, { garmentType: event.target.value, unitPrice: getDefaultPrice(event.target.value) })}
                onKeyDown={(event) => nextOnEnter(event, () => serviceRefs.current[index]?.focus())}
              >
                {settings.garmentTypes.map((garment) => <option key={garment} value={garment}>{garment}</option>)}
              </select>
              <select
                ref={(node) => { serviceRefs.current[index] = node }}
                value={item.serviceType}
                onChange={(event) => {
                  const serviceType = event.target.value
                  updateItem(index, { serviceType })
                }}
                onKeyDown={(event) => nextOnEnter(event, () => quantityRefs.current[index]?.focus())}
              >
                {settings.serviceTypes.map((service) => <option key={service} value={service}>{service}</option>)}
              </select>
              <input
                ref={(node) => { quantityRefs.current[index] = node }}
                type="number"
                value={item.quantity}
                onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                onKeyDown={(event) => nextOnEnter(event, () => priceRefs.current[index]?.focus())}
              />
              <input
                ref={(node) => { priceRefs.current[index] = node }}
                type="number"
                value={item.unitPrice || ''}
                placeholder="Enter rate"
                onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) })}
                onKeyDown={(event) => nextOnEnter(event, () => addItem())}
              />
              <strong>{formatMoney(item.quantity * item.unitPrice)}</strong>
              <button className="remove-button" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <aside className="sticky-summary card">
        <p className="eyebrow">Order total</p>
        <strong>{formatMoney(total)}</strong>
        <button className="button primary large" onClick={submit} disabled={!hasValidPhone || !(matchedCustomer?.name || name) || items.length === 0 || items.some((item) => item.unitPrice <= 0)}>
          Save & print
        </button>
      </aside>
    </section>
  )
}
