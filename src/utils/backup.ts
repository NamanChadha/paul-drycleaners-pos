import type { Customer, Item, Order, Payment, Settings } from '../types/models'

const csvCell = (value: string | number | undefined) => `"${String(value ?? '').replaceAll('"', '""')}"`

export function downloadExcelBackup({ customers, orders, items, payments }: { customers: Customer[]; orders: Order[]; items: Item[]; payments: Payment[] }) {
  const customerById = new Map(customers.map((customer) => [customer.id, customer]))
  const rows = [
    ['Receipt No.', 'Customer', 'Phone', 'Receipt Date', 'Delivery Date', 'Status', 'Total', 'Paid', 'Due', 'Delivered At', 'Handed Over By', 'Delivery Note', 'Items'],
    ...orders.map((order) => {
      const customer = customerById.get(order.customerId)
      const itemSummary = items.filter((item) => item.orderId === order.id).map((item) => `${item.quantity} × ${item.garmentType}`).join('; ')
      return [order.orderNumber, customer?.name, customer?.phone, order.receiptDate, order.deliveryDate, order.status, order.totalAmount, order.paidAmount, order.dueAmount, order.deliveredAt, order.deliveredBy, order.deliveryNote, itemSummary]
    }),
    [],
    ['Customer balances'],
    ['Customer', 'Phone', 'Address', 'Outstanding balance', 'Created'],
    ...customers.map((customer) => [customer.name, customer.phone, customer.address, customer.totalDue, customer.createdAt]),
    [],
    ['Payment history'],
    ['Customer', 'Amount', 'Method', 'Receipt count', 'Recorded at'],
    ...payments.map((payment) => [customerById.get(payment.customerId)?.name, payment.amountPaid, payment.paymentMethod, payment.ordersCovered.length, payment.createdAt]),
  ]
  const blob = new Blob([rows.map((row) => row.map((value) => csvCell(value as string | number | undefined)).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `paul-drycleaners-backup-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadTransferBackup(data: { customers: Customer[]; orders: Order[]; items: Item[]; payments: Payment[]; settings: Settings }) {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `paul-drycleaners-transfer-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function isTransferBackup(value: unknown): value is { customers: Customer[]; orders: Order[]; items: Item[]; payments: Payment[]; settings: Settings } {
  if (!value || typeof value !== 'object') return false
  const backup = value as Record<string, unknown>
  return Array.isArray(backup.customers) && Array.isArray(backup.orders) && Array.isArray(backup.items) && Array.isArray(backup.payments) && Boolean(backup.settings)
}
