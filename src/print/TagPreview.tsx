import type { Item, Settings } from '../types/models'

export function TagPreview({ items, settings }: { items: Item[]; settings: Settings }) {
  return (
    <section id="tag-print-area" className="tag-grid">
      {items.map((item) => (
        <div key={item.id} className="tag-card">
          <strong>{settings.shopName}</strong>
          <span>{item.tagCode}</span>
        </div>
      ))}
    </section>
  )
}
