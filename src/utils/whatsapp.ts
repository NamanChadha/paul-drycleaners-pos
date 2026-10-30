import type { Customer, Item, Order, Settings } from '../types/models'
import { formatDate } from './date'
import { formatMoney } from './money'

export function buildWhatsAppBillMessage({
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
  const lines = [
    `Hello ${customer.name},`,
    '',
    `${settings.shopName} receipt #${order.orderNumber}`,
    `Received: ${formatDate(order.receiptDate)}`,
    `Delivery: ${formatDate(order.deliveryDate)}`,
    '',
    ...items.map((item) => `${item.quantity} x ${item.garmentType} (${item.serviceType}) - ${formatMoney(item.totalPrice)}`),
    '',
    `Total: ${formatMoney(order.totalAmount)}`,
    `Paid: ${formatMoney(order.paidAmount)}`,
    `Due: ${formatMoney(order.dueAmount)}`,
    '',
    'Thank you.',
  ]
  return lines.join('\n')
}


export function buildWhatsAppBillUrl({
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
  const rawPhone = customer.phone.replace(/\D/g, '')
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
  const text = encodeURIComponent(buildWhatsAppBillMessage({ customer, order, items, settings }))
  return `https://wa.me/${phone}?text=${text}`
}

export function buildWhatsAppDeliveryUrl(customer: Customer, order: Order, settings: Settings, items: Item[] = []) {
  const rawPhone = customer.phone.replace(/\D/g, '')
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
  const delivered = items.filter((item) => item.isDelivered)
  const pending = items.filter((item) => !item.isDelivered)
  const greeting = customer.name && !customer.name.startsWith('Customer (') ? `Hello ${customer.name},` : 'Hello,'
  const lines = [greeting, '', `${settings.shopName} receipt #${order.orderNumber}`, 'Delivery status:',
    ...delivered.map((item) => `✓ ${item.quantity} × ${item.garmentType} (${item.serviceType}) — Delivered`),
    ...pending.map((item) => `◷ ${item.quantity} × ${item.garmentType} (${item.serviceType}) — Pending`),
    '', delivered.length && !pending.length ? 'All items have been delivered.' : `${delivered.length} of ${items.length} item entries delivered.`,
    `Due: ${formatMoney(order.dueAmount)}`, '', 'Thank you.']
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`
}
