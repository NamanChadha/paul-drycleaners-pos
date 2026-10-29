import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateDeliveryDate } from '../utils/date'
import { formatMoney } from '../utils/money'
import { useShopStore } from '../store/useShopStore'
import { SALUTATIONS, type Salutation, splitCustomerTitle, combineCustomerName } from '../utils/customer'
import type { Customer } from '../types/models'

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

  const makeItem = (garmentType?: string): DraftItem => {
    const g = garmentType || settings.garmentTypes[0] || ''
    return {
      garmentType: g,
      serviceType: defaultService,
      quantity: 1,
      unitPrice: getDefaultPrice(g),
    }
  }

  // Customer state
  const [title, setTitle] = useState<Salutation>('Mr.')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionField, setSuggestionField] = useState<'phone' | 'name' | null>(null)

  // Order state
  const [deliveryDate, setDeliveryDate] = useState(
    calculateDeliveryDate(settings.deliveryOffsetDays, settings.sundayClosed),
  )
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftItem[]>([makeItem()])
  const userInteractedWithItems = useRef(false)

  // Refs for keyboard navigation
  const phoneRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const garmentRefs = useRef<Array<HTMLSelectElement | null>>([])
  const serviceRefs = useRef<Array<HTMLSelectElement | null>>([])
  const quantityRefs = useRef<Array<HTMLInputElement | null>>([])
  const priceRefs = useRef<Array<HTMLInputElement | null>>([])

  // Suggestions for autocomplete / remembering customers (case-insensitive & capslock-proof)
  const filteredSuggestions = useMemo(() => {
    const normPhone = phone.replace(/\D/g, '')
    const queryName = name.trim().toLowerCase()
    if (!normPhone && !queryName) return []

    return customers
      .filter((customer) => {
        const cPhone = customer.phone.replace(/\D/g, '')
        const cFullName = customer.name.toLowerCase()
        const cCleanName = splitCustomerTitle(customer.name).cleanName.toLowerCase()
        const cAddress = (customer.address || '').toLowerCase()

        const matchPhone = normPhone.length >= 1 && cPhone.includes(normPhone)
        const matchName =
          queryName.length >= 1 &&
          (cFullName.includes(queryName) || cCleanName.includes(queryName) || cAddress.includes(queryName))
        return matchPhone || matchName
      })
      .slice(0, 8)
  }, [customers, phone, name])

  const selectCustomer = (c: Customer) => {
    const parsed = splitCustomerTitle(c.name)
    setTitle(parsed.title)
    setName(parsed.cleanName)
    setPhone(c.phone)
    setAddress(c.address || '')
    setSelectedCustomerId(c.id)
    setShowSuggestions(false)
  }

  const clearCustomer = () => {
    setSelectedCustomerId(null)
    setTitle('Mr.')
    setName('')
    setPhone('')
    setAddress('')
    setShowSuggestions(false)
    phoneRef.current?.focus()
  }

  // Check if phone matches an existing customer as user types
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 10)
    setPhone(raw)
    setSuggestionField('phone')
    setShowSuggestions(true)

    // If exact 10 digits match an existing customer, auto-select them
    if (raw.length === 10) {
      const match = customers.find((c) => c.phone.replace(/\D/g, '') === raw)
      if (match) {
        selectCustomer(match)
      }
    }
  }

  // Case-insensitive automatic customer identification as user types name
  const handleNameChange = (val: string) => {
    setName(val)
    setSuggestionField('name')
    setShowSuggestions(true)

    const cleanInput = val.trim().toLowerCase()
    if (cleanInput.length >= 2) {
      // Find case-insensitive exact match
      const exactMatch = customers.find((c) => {
        const full = c.name.trim().toLowerCase()
        const clean = splitCustomerTitle(c.name).cleanName.trim().toLowerCase()
        return full === cleanInput || clean === cleanInput
      })

      if (exactMatch) {
        setSelectedCustomerId(exactMatch.id)
        const parsed = splitCustomerTitle(exactMatch.name)
        setTitle(parsed.title)
        if (exactMatch.phone && !phone) setPhone(exactMatch.phone)
        if (exactMatch.address && !address) setAddress(exactMatch.address)
      } else if (selectedCustomerId) {
        const current = customers.find((c) => c.id === selectedCustomerId)
        if (
          current &&
          current.name.trim().toLowerCase() !== cleanInput &&
          splitCustomerTitle(current.name).cleanName.trim().toLowerCase() !== cleanInput
        ) {
          setSelectedCustomerId(null)
        }
      }
    }
  }

  // Selected customer record (if any)
  const activeCustomer = selectedCustomerId
    ? customers.find((c) => c.id === selectedCustomerId) ?? null
    : null

  // Fast entry handler - clicking a chip ADDS the item!
  const handleQuickAdd = (garment: string) => {
    const defaultGarment = settings.garmentTypes[0] ?? ''
    const defaultPrice = getDefaultPrice(garment)

    setItems((current) => {
      // If table only has 1 item and user hasn't touched anything, replace the initial placeholder
      if (
        !userInteractedWithItems.current &&
        current.length === 1 &&
        current[0].garmentType === defaultGarment &&
        current[0].quantity === 1 &&
        current[0].unitPrice === getDefaultPrice(defaultGarment)
      ) {
        userInteractedWithItems.current = true
        return [
          {
            garmentType: garment,
            serviceType: defaultService,
            quantity: 1,
            unitPrice: defaultPrice,
          },
        ]
      }

      userInteractedWithItems.current = true
      return [
        ...current,
        {
          garmentType: garment,
          serviceType: defaultService,
          quantity: 1,
          unitPrice: defaultPrice,
        },
      ]
    })

    window.setTimeout(() => {
      const targetIndex = items.length
      quantityRefs.current[targetIndex]?.focus()
    }, 50)
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items])

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    userInteractedWithItems.current = true
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const addItem = (focus = true) => {
    userInteractedWithItems.current = true
    setItems((current) => [...current, makeItem()])
    if (focus) window.setTimeout(() => garmentRefs.current[items.length]?.focus(), 0)
  }

  const removeItem = (index: number) => {
    userInteractedWithItems.current = true
    setItems((current) => (current.length === 1 ? [makeItem()] : current.filter((_, itemIndex) => itemIndex !== index)))
  }

  const nextOnEnter = (event: KeyboardEvent, next?: () => void) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    next?.()
  }

  // Validation: Name, phone, address are ALL optional, but at least ONE must be filled!
  const hasCustomerDetail = Boolean(name.trim() || phone.trim() || address.trim())
  const hasValidItems = items.length > 0 && items.every((item) => item.unitPrice > 0 && item.quantity > 0)
  const canSubmit = hasCustomerDetail && hasValidItems

  const submit = () => {
    if (!canSubmit) return

    const combinedName = combineCustomerName(title, name)
    const order = createOrder({
      customer: {
        id: selectedCustomerId || undefined,
        name: combinedName,
        phone,
        address,
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
          {activeCustomer && (
            <div className="returning-customer" role="status">
              <div>
                <span>✓</span> <strong>Returning customer:</strong> {activeCustomer.name}
                {activeCustomer.phone ? ` · ${activeCustomer.phone}` : ''}
                {activeCustomer.totalDue > 0 && (
                  <span className="suggestion-badge" style={{ marginLeft: 8 }}>
                    {formatMoney(activeCustomer.totalDue)} outstanding
                  </span>
                )}
                <small style={{ display: 'block', color: '#1e40af', fontSize: '11px', marginTop: 2 }}>
                  (You can edit name, phone, or address below — changes will update this customer's profile)
                </small>
              </div>
              <button type="button" className="returning-customer-clear" onClick={clearCustomer}>
                Clear / New customer
              </button>
            </div>
          )}

          <div className="compact-form-grid">
            {/* Phone (Optional) */}
            <label className="field-with-suggestions">
              Phone (optional)
              <input
                ref={phoneRef}
                autoFocus
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                value={phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                onFocus={() => {
                  setSuggestionField('phone')
                  setShowSuggestions(true)
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 200)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (showSuggestions && suggestionField === 'phone' && filteredSuggestions.length > 0) {
                      selectCustomer(filteredSuggestions[0])
                    }
                    nameRef.current?.focus()
                  } else if (event.key === 'Escape') {
                    setShowSuggestions(false)
                  }
                }}
              />
              {showSuggestions && suggestionField === 'phone' && filteredSuggestions.length > 0 && (
                <div className="suggestions-dropdown" onMouseDown={(e) => e.preventDefault()}>
                  {filteredSuggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="suggestion-item"
                      onClick={() => selectCustomer(c)}
                    >
                      <div className="suggestion-main">
                        <span className="suggestion-name">{c.name}</span>
                        <span className="suggestion-meta">
                          {c.phone ? `Ph: ${c.phone}` : 'No phone'}
                          {c.address ? ` · ${c.address}` : ''}
                        </span>
                      </div>
                      {c.totalDue > 0 && (
                        <span className="suggestion-badge">{formatMoney(c.totalDue)} due</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </label>

            {/* Name with Mr. / Mrs. selector (Optional) */}
            <label className="field-with-suggestions">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Name (optional)</span>
                <span className="title-pills">
                  <button
                    type="button"
                    className={`title-pill-btn ${title === 'Mr.' ? 'active' : ''}`}
                    onClick={() => setTitle('Mr.')}
                  >
                    Mr.
                  </button>
                  <button
                    type="button"
                    className={`title-pill-btn ${title === 'Mrs.' ? 'active' : ''}`}
                    onClick={() => setTitle('Mrs.')}
                  >
                    Mrs.
                  </button>
                </span>
              </span>
              <div className="name-input-group">
                <select
                  className="title-select"
                  value={title}
                  onChange={(e) => setTitle(e.target.value as Salutation)}
                  aria-label="Salutation prefix"
                >
                  {SALUTATIONS.map((sal) => (
                    <option key={sal} value={sal}>
                      {sal}
                    </option>
                  ))}
                </select>
                <input
                  ref={nameRef}
                  placeholder="Customer name"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  onFocus={() => {
                    setSuggestionField('name')
                    setShowSuggestions(true)
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setShowSuggestions(false), 200)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      if (showSuggestions && suggestionField === 'name' && filteredSuggestions.length > 0) {
                        selectCustomer(filteredSuggestions[0])
                      }
                      addressRef.current?.focus()
                    } else if (event.key === 'Escape') {
                      setShowSuggestions(false)
                    }
                  }}
                />
              </div>

              {showSuggestions && suggestionField === 'name' && filteredSuggestions.length > 0 && (
                <div className="suggestions-dropdown" onMouseDown={(e) => e.preventDefault()}>
                  {filteredSuggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="suggestion-item"
                      onClick={() => selectCustomer(c)}
                    >
                      <div className="suggestion-main">
                        <span className="suggestion-name">{c.name}</span>
                        <span className="suggestion-meta">
                          {c.phone ? `Ph: ${c.phone}` : 'No phone'}
                          {c.address ? ` · ${c.address}` : ''}
                        </span>
                      </div>
                      {c.totalDue > 0 && (
                        <span className="suggestion-badge">{formatMoney(c.totalDue)} due</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </label>

            {/* Address (Optional) */}
            <label className="address-field">
              Address (optional)
              <input
                ref={addressRef}
                placeholder="Locality / house no."
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                onKeyDown={(event) => nextOnEnter(event, () => garmentRefs.current[0]?.focus())}
              />
            </label>

            <label>Delivery date<input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} /></label>
            <label>Paid now<input type="number" value={paidAmount} onChange={(event) => setPaidAmount(Number(event.target.value))} /></label>
            <label className="address-field">Notes<input value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
          </div>

          {!hasCustomerDetail && (
            <small style={{ color: '#d97706', marginTop: 8, display: 'block', fontWeight: 500 }}>
              * Fill at least one: Name, Phone, or Address
            </small>
          )}
        </div>

        {/* Fast Entry & Items List */}
        <div className="card items-card stack compact-stack">
          <div className="row between">
            <div>
              <p className="eyebrow">Fast entry</p>
              <h3>Items</h3>
            </div>
            <div className="row">
              <button type="button" className="button primary add-item-button" onClick={() => addItem()}>+ Add item</button>
            </div>
          </div>

          {/* Quick Garment Chips: Clicking adds the item directly! */}
          <div className="quick-garments">
            {settings.quickAddItems
              .filter((garment) => settings.garmentTypes.includes(garment))
              .map((garment) => (
                <button
                  key={garment}
                  type="button"
                  className="chip"
                  onClick={() => handleQuickAdd(garment)}
                  title={`Click to add ${garment} (₹${getDefaultPrice(garment)})`}
                >
                  <span>+ {garment}</span>
                  <span className="chip-price-badge">₹{getDefaultPrice(garment)}</span>
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
                min="1"
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
              <button type="button" className="remove-button" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      <aside className="sticky-summary card">
        <p className="eyebrow">Order total</p>
        <strong>{formatMoney(total)}</strong>
        <button
          className="button primary large"
          onClick={submit}
          disabled={!canSubmit}
          title={!hasCustomerDetail ? 'Please enter at least one: Name, Phone, or Address' : undefined}
        >
          Save & print
        </button>
        {!hasCustomerDetail && (
          <small style={{ color: '#b91c1c', fontSize: '12px' }}>
            Enter at least Name, Phone, or Address to save
          </small>
        )}
      </aside>
    </section>
  )
}
