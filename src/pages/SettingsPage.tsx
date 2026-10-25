import { useRef, useState, type ChangeEvent } from 'react'
import { useShopStore } from '../store/useShopStore'
import { useSessionStore } from '../store/useSessionStore'
import { downloadExcelBackup, downloadTransferBackup, isTransferBackup } from '../utils/backup'

export function SettingsPage() {
  const { settings, updateSettings, customers, orders, items, payments, replaceData } = useShopStore()
  const role = useSessionStore((state) => state.role)
  const [garmentTypes, setGarmentTypes] = useState(settings.garmentTypes.join(', '))
  const [serviceTypes, setServiceTypes] = useState(settings.serviceTypes.join(', '))
  const [quickAddItems, setQuickAddItems] = useState(settings.quickAddItems.join(', '))
  const [garmentPrices, setGarmentPrices] = useState(
    Object.entries(settings.garmentPrices)
      .map(([name, price]) => `${name}:${price}`)
      .join(', '),
  )
  const transferInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <section className="stack">
      <header className="page-header"><div><p className="eyebrow">Configuration</p><h2>Settings</h2></div></header>
      <div className="card backup-card">
        <div><p className="eyebrow">Data safety</p><h3>Download a backup for Excel</h3><p>Includes every receipt, customer balance, delivery handover record, and payment.</p></div>
        <button className="button primary" onClick={() => downloadExcelBackup({ customers, orders, items, payments })}>Download backup</button>
      </div>
      <div className="card backup-card">
        <div><p className="eyebrow">Move to another laptop</p><h3>Transfer all app data</h3><p>Download this file on the old laptop, then restore it from Settings on the new one.</p></div>
        <div className="row"><button className="button" onClick={() => downloadTransferBackup({ customers, orders, items, payments, settings })}>Download transfer file</button><input ref={transferInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={restoreTransferBackup} /><button className="button primary" onClick={() => transferInputRef.current?.click()}>Restore transfer file</button></div>
      </div>
      <div className="card form-grid">
        <label>Shop name<input value={settings.shopName} onChange={(event) => updateSettings({ shopName: event.target.value })} /></label>
        <label>Phone<input value={settings.phone} onChange={(event) => updateSettings({ phone: event.target.value })} /></label>
        <label className="full">Address<input value={settings.address} onChange={(event) => updateSettings({ address: event.target.value })} /></label>
        <label>Delivery offset<input type="number" value={settings.deliveryOffsetDays} onChange={(event) => updateSettings({ deliveryOffsetDays: Number(event.target.value) })} /></label>
        <label>Next order number<input type="number" min={1} max={10000} value={settings.nextOrderNumber} onChange={(event) => updateSettings({ nextOrderNumber: Math.min(10000, Math.max(1, Number(event.target.value))) })} /></label>
        <label>Sunday closed<input type="checkbox" checked={settings.sundayClosed} onChange={(event) => updateSettings({ sundayClosed: event.target.checked })} /></label>
        <label>Receipt top offset (mm)<input type="number" value={settings.receiptOffsets.top} onChange={(event) => updateSettings({ receiptOffsets: { ...settings.receiptOffsets, top: Number(event.target.value) } })} /></label>
        <label>Receipt left offset (mm)<input type="number" value={settings.receiptOffsets.left} onChange={(event) => updateSettings({ receiptOffsets: { ...settings.receiptOffsets, left: Number(event.target.value) } })} /></label>
        <label className="full">Garment types<input value={garmentTypes} onChange={(event) => setGarmentTypes(event.target.value)} onBlur={() => updateSettings({ garmentTypes: garmentTypes.split(',').map((entry) => entry.trim()).filter(Boolean) })} /></label>
        <label className="full">
          Quick Add items
          <input
            value={quickAddItems}
            placeholder="e.g. Shirts, Pant, Suit 2pc., Saree"
            onChange={(event) => setQuickAddItems(event.target.value)}
            onBlur={() => {
              const nextQuickAddItems = [...new Set(quickAddItems.split(',').map((entry) => entry.trim()).filter(Boolean))]
              setQuickAddItems(nextQuickAddItems.join(', '))
              updateSettings({
                quickAddItems: nextQuickAddItems,
                garmentTypes: [...new Set([...settings.garmentTypes, ...nextQuickAddItems])],
              })
            }}
          />
          <small>Add comma-separated item names to show them as Quick Add buttons on a new order.</small>
        </label>
        <label className="full">
          Service types
          <input
            value={serviceTypes}
            onChange={(event) => setServiceTypes(event.target.value)}
            onBlur={() =>
              updateSettings({
                serviceTypes: serviceTypes
                  .split(',')
                  .map((entry) => entry.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="full">
          Default article prices
          <input
            value={garmentPrices}
            onChange={(event) => setGarmentPrices(event.target.value)}
            onBlur={() =>
              updateSettings({
                garmentPrices: Object.fromEntries(
                  garmentPrices
                    .split(',')
                    .map((entry) => entry.trim())
                    .filter(Boolean)
                    .map((entry) => {
                      const [name, price] = entry.split(':').map((value) => value.trim())
                      return [name, Number(price || 0)]
                    }),
                ),
              })
            }
          />
        </label>
        <label>Admin username<input value={settings.localUsers.admin.username} onChange={(event) => updateSettings({ localUsers: { ...settings.localUsers, admin: { ...settings.localUsers.admin, username: event.target.value } } })} /></label>
        <label>Admin password<input value={settings.localUsers.admin.password} onChange={(event) => updateSettings({ localUsers: { ...settings.localUsers, admin: { ...settings.localUsers.admin, password: event.target.value } } })} /></label>
        <label>Reception username<input value={settings.localUsers.reception.username} onChange={(event) => updateSettings({ localUsers: { ...settings.localUsers, reception: { ...settings.localUsers.reception, username: event.target.value } } })} /></label>
        <label>Reception password<input value={settings.localUsers.reception.password} onChange={(event) => updateSettings({ localUsers: { ...settings.localUsers, reception: { ...settings.localUsers.reception, password: event.target.value } } })} /></label>
      </div>
    </section>
  )
}
