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

export function buildWhatsAppDeliveryUrl(customer: Customer, order: Order, settings: Settings) {
  const rawPhone = customer.phone.replace(/\D/g, '')
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : new Date()
  const deliveredDate = deliveredAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const deliveredTime = deliveredAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const message = [
    `Hello ${customer.name},`,
    '',
    `Your clothes from ${settings.shopName} (receipt #${order.orderNumber}) have been delivered.`,
    `Delivery date: ${deliveredDate}`,
    `Delivery time: ${deliveredTime}`,
    '',
    'Thank you.',
  ].join('\n')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
