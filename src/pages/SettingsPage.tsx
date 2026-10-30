import { useRef, useState, type ChangeEvent } from 'react'
import { useShopStore } from '../store/useShopStore'
import { useSessionStore } from '../store/useSessionStore'
import { downloadExcelBackup, downloadTransferBackup, isTransferBackup } from '../utils/backup'
import type { Settings } from '../types/models'

// Helper: convert settings arrays/objects to editable strings
function settingsToStrings(s: Settings) {
  return {
    garmentTypes: s.garmentTypes.join(', '),
    serviceTypes: s.serviceTypes.join(', '),
    quickAddItems: s.quickAddItems.join(', '),
    garmentPrices: Object.entries(s.garmentPrices)
      .map(([name, price]) => `${name}:${price}`)
      .join(', '),
  }
}

export function SettingsPage() {
  const { settings, updateSettings, customers, orders, items, payments, replaceData } = useShopStore()
  const role = useSessionStore((state) => state.role)

  // Draft holds all field values while editing; only committed on Save.
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<Settings>(settings)
  const [draftStrings, setDraftStrings] = useState(() => settingsToStrings(settings))
  const transferInputRef = useRef<HTMLInputElement>(null)

  const startEditing = () => {
    setDraft(structuredClone(settings))
    setDraftStrings(settingsToStrings(settings))
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    // Discard draft — do NOT call updateSettings, so the store stays unchanged.
  }

  const saveEditing = () => {
    // Parse the text-area style string fields into arrays/objects
    const garmentTypes = draftStrings.garmentTypes.split(',').map((e) => e.trim()).filter(Boolean)
    const serviceTypes = draftStrings.serviceTypes.split(',').map((e) => e.trim()).filter(Boolean)
    const rawQuickAdd = draftStrings.quickAddItems.split(',').map((e) => e.trim()).filter(Boolean)
    const quickAddItems = [...new Set(rawQuickAdd)]
    const garmentPrices = Object.fromEntries(
      draftStrings.garmentPrices
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
        .map((e) => {
          const [name, price] = e.split(':').map((v) => v.trim())
          return [name, Number(price || 0)]
        }),
    )
    updateSettings({
      ...draft,
      garmentTypes: [...new Set([...garmentTypes, ...quickAddItems])],
      serviceTypes,
      quickAddItems,
      garmentPrices,
      garmentCategories: Object.fromEntries(garmentTypes.map((item) => [item, draft.garmentCategories?.[item] || 'Unisex'])),
    })
    setIsEditing(false)
  }

  const restoreTransferBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const backup: unknown = JSON.parse(await file.text())
      if (!isTransferBackup(backup)) throw new Error('Invalid backup')
      if (!window.confirm('Replace all current customers, receipts, payments, and settings with this backup?')) return
      replaceData(backup)
      window.alert('Backup restored successfully.')
    } catch {
      window.alert('That file is not a valid Paul Drycleaners transfer backup.')
    }
  }

  if (role === 'reception') {
    return <section className="card">Only the admin can change prices and account settings.</section>
  }

  // Display values: use draft while editing, live settings when locked
  const d = isEditing ? draft : settings
  const ds = isEditing ? draftStrings : settingsToStrings(settings)

  const setD = (patch: Partial<Settings>) => setDraft((prev) => ({ ...prev, ...patch }))
  const setDs = (patch: Partial<typeof draftStrings>) => setDraftStrings((prev) => ({ ...prev, ...patch }))

  return (
    <section className="stack">
      <header className="page-header">
        <div><p className="eyebrow">Configuration</p><h2>Settings</h2></div>
        <div className="row">
          {isEditing ? (
            <>
              <button className="button" onClick={cancelEditing}>Cancel</button>
              <button className="button primary" onClick={saveEditing}>Save settings</button>
            </>
          ) : (
            <button className="button primary" onClick={startEditing}>Edit settings</button>
          )}
        </div>
      </header>
      <p className="settings-save-note">Choose <strong>Edit settings</strong> before changing values, then <strong>Save settings</strong> to keep them. Nothing is saved until you click Save.</p>

      <div className="card backup-card">
        <div><p className="eyebrow">Data safety</p><h3>Download a backup for Excel</h3><p>Includes every receipt, customer balance, delivery handover record, and payment.</p></div>
        <button className="button primary" onClick={() => downloadExcelBackup({ customers, orders, items, payments })}>Download backup</button>
      </div>
      <div className="card backup-card">
        <div><p className="eyebrow">Move to another laptop</p><h3>Transfer all app data</h3><p>Download this file on the old laptop, then restore it from Settings on the new one.</p></div>
        <div className="row">
          <button className="button" onClick={() => downloadTransferBackup({ customers, orders, items, payments, settings })}>Download transfer file</button>
          <input ref={transferInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={restoreTransferBackup} />
          <button className="button primary" onClick={() => transferInputRef.current?.click()}>Restore transfer file</button>
        </div>
      </div>

      <fieldset className="card form-grid settings-fields" disabled={!isEditing}>
        <label>Shop name<input value={d.shopName} onChange={(e) => setD({ shopName: e.target.value })} /></label>
        <label>Phone<input value={d.phone} onChange={(e) => setD({ phone: e.target.value })} /></label>
        <label className="full">Address<input value={d.address} onChange={(e) => setD({ address: e.target.value })} /></label>
        <label>Delivery offset (days)<input type="number" value={d.deliveryOffsetDays} onChange={(e) => setD({ deliveryOffsetDays: Number(e.target.value) })} /></label>
        <label>Next order number<input type="number" min={1} max={10000} value={d.nextOrderNumber} onChange={(e) => setD({ nextOrderNumber: Math.min(10000, Math.max(1, Number(e.target.value))) })} /></label>
        <label>Sunday closed<input type="checkbox" checked={d.sundayClosed} onChange={(e) => setD({ sundayClosed: e.target.checked })} /></label>
        <label>Receipt top offset (mm)<input type="number" value={d.receiptOffsets.top} onChange={(e) => setD({ receiptOffsets: { ...d.receiptOffsets, top: Number(e.target.value) } })} /></label>
        <label>Receipt left offset (mm)<input type="number" value={d.receiptOffsets.left} onChange={(e) => setD({ receiptOffsets: { ...d.receiptOffsets, left: Number(e.target.value) } })} /></label>
        <label className="full">Garment types (comma-separated)<input value={ds.garmentTypes} onChange={(e) => setDs({ garmentTypes: e.target.value })} /></label>
        <div className="full stack compact-stack"><strong>Item gender categories</strong><small>Assign each garment to Men's, Women's or Unisex. Existing items default to Unisex until categorized.</small>{d.garmentTypes.map((garment) => <label key={garment}>{garment}<select value={d.garmentCategories?.[garment] || 'Unisex'} onChange={(e) => setD({ garmentCategories: { ...d.garmentCategories, [garment]: e.target.value as "Men's" | "Women's" | 'Unisex' } })}><option>Men's</option><option>Women's</option><option>Unisex</option></select></label>)}</div>
        <label className="full">
          Quick Add items
          <input value={ds.quickAddItems} placeholder="e.g. Shirts, Pant, Suit 2pc., Saree" onChange={(e) => setDs({ quickAddItems: e.target.value })} />
          <small>Comma-separated item names shown as Quick Add buttons on a new order.</small>
        </label>
        <label className="full">Service types (comma-separated)<input value={ds.serviceTypes} onChange={(e) => setDs({ serviceTypes: e.target.value })} /></label>
        <label className="full">
          Default article prices (format: ItemName:Price, …)
          <input value={ds.garmentPrices} onChange={(e) => setDs({ garmentPrices: e.target.value })} />
        </label>
        <label>Admin username<input value={d.localUsers.admin.username} onChange={(e) => setD({ localUsers: { ...d.localUsers, admin: { ...d.localUsers.admin, username: e.target.value } } })} /></label>
        <label>Admin password<input type="password" value={d.localUsers.admin.password} onChange={(e) => setD({ localUsers: { ...d.localUsers, admin: { ...d.localUsers.admin, password: e.target.value } } })} /></label>
        <label>Reception username<input value={d.localUsers.reception.username} onChange={(e) => setD({ localUsers: { ...d.localUsers, reception: { ...d.localUsers.reception, username: e.target.value } } })} /></label>
        <label>Reception password<input type="password" value={d.localUsers.reception.password} onChange={(e) => setD({ localUsers: { ...d.localUsers, reception: { ...d.localUsers.reception, password: e.target.value } } })} /></label>
      </fieldset>
    </section>
  )
}
