import { create } from 'zustand'
import { persist, type PersistStorage } from 'zustand/middleware'
import type { Customer, Item, Order, OrderStatus, Payment, PaymentStatus, Settings } from '../types/models'
import { calculateDeliveryDate, todayIso } from '../utils/date'

type DraftItem = Omit<Item, 'id' | 'orderId' | 'itemNo' | 'tagCode' | 'totalPrice'>

interface ShopState {
  customers: Customer[]
  orders: Order[]
  items: Item[]
  payments: Payment[]
  settings: Settings
  addOrUpdateCustomer: (input: { id?: string; name: string; phone: string; address: string }) => Customer
  updateCustomer: (id: string, patch: Partial<Pick<Customer, 'name' | 'phone' | 'address'>>) => void
  createOrder: (input: {
    customer: { id?: string; name: string; phone: string; address: string }
    deliveryDate?: string
    paidAmount: number
    notes: string
    items: DraftItem[]
  }) => Order
  updateOrderStatus: (orderId: string, status: OrderStatus, handover?: { deliveredBy: string; deliveryNote: string }) => void
  toggleItemDelivery: (itemId: string, deliveredBy?: string) => void
  recordPayment: (input: Omit<Payment, 'id' | 'createdAt'>) => void
  updateSettings: (patch: Partial<Settings>) => void
  replaceData: (backup: Pick<ShopState, 'customers' | 'orders' | 'items' | 'payments' | 'settings'>) => void
}

const folderStorage = {
  async getItem(name: string) {
    try {
      const response = await fetch('/api/store')
      if (response.ok) {
        const saved = await response.json()
        if (saved) return saved
      }
    } catch {
      // Local service not available or running standalone
    }
    const previous = localStorage.getItem(name)
    return previous ? JSON.parse(previous) : null
  },
  async setItem(name: string, value: unknown) {
    try {
      localStorage.setItem(name, JSON.stringify(value))
    } catch (e) {
      console.warn('Could not save to localStorage:', e)
    }
    try {
      await fetch('/api/store', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })
    } catch {
      // Local file service not available
    }
  },
  async removeItem(name: string) {
    try { localStorage.removeItem(name) } catch { /* Browser storage may be unavailable. */ }
    try { await fetch('/api/store', { method: 'DELETE' }) } catch { /* Local server may be unavailable. */ }
  },
} as PersistStorage<ShopState>

const seedSettings: Settings = {
  shopName: 'Paul Drycleaners',
  address: '100 No. Chowk, Model Town, PANIPAT - 132 103',
  phone: '85292-00026, 98962-03343',
  deliveryOffsetDays: 3,
  sundayClosed: true,
  serviceTypes: ['Dryclean', 'Steam Press', 'Charakh'],
  garmentPrices: {
    'Suit 2pc.': 300,
    'Suit 3pc.': 400,
    Coat: 200,
    Pant: 120,
    'J/Jacket': 180,
    Kurta: 130,
    'Sweat Shirt': 180,
    'Sweater HS': 150,
    lower: 120,
    Jackets: 200,
    'Half Jacket': 180,
    'Leather Jacket': 300,
    'suede jacket': 350,
    'Gents Shawl': 180,
    Shirts: 100,
    'Pair of Shoes': 300,
    'ladiesSuit 2pc': 250,
    'Ladies Suit 3pc': 300,
    Saree: 220,
    Blouse: 60,
    Dupatta: 80,
    Sharara: 140,
    'sharara shirt 2pc': 280,
    'sharara shirt 3pc': 350,
    Dress: 180,
    'Ladies Shirt': 130,
    'Shirt(L)': 100,
    parallel: 120,
    'Ladies Top': 100,
  },
  garmentTypes: [
    'Suit 2pc.', 'Suit 3pc.', 'Coat', 'Pant', 'J/Jacket', 'Kurta', 'Sweat Shirt', 'Sweater HS', 'lower',
    'Jackets', 'Half Jacket', 'Leather Jacket', 'suede jacket', 'Gents Shawl', 'Shirts', 'Sherwani Indo Western',
    'Over Coat', 'stall', 'Pair of Shoes', 'ladiesSuit 2pc', 'Bridal Lehanga', 'Ladies Suit 3pc', 'Shawl',
    'Shawl Pashmina', 'Cardigan F.S.', 'Cardigan H.S.', 'Saree', 'Blouse', 'Ladies Overcoat', 'Dupatta', 'Sharara',
    'sharara shirt 2pc', 'sharara shirt 3pc', 'Dress', 'Ladies Shirt', 'Shirt(L)', 'parallel', 'Ladies Top',
    'Blanket Single', 'Blanket Double', 'Curtains', 'Bed Sheets Single', 'Bed Sheets Double', 'Hand Bag',
    'Backpack', 'trolley', 'Blinds', 'Carpets', 'Quilt Single', 'Quilt Double',
  ],
  quickAddItems: ['Shirts', 'Pant', 'Suit 2pc.', 'Saree'],
  nextOrderNumber: 1,
  receiptOffsets: { top: 0, left: 0 },
  localUsers: {
    admin: { username: 'admin', password: 'admin123' },
    reception: { username: 'reception', password: 'reception123' },
  },
}

const id = () => crypto.randomUUID()
const paymentStatus = (paidAmount: number, totalAmount: number): PaymentStatus =>
  paidAmount <= 0 ? 'unpaid' : paidAmount >= totalAmount ? 'paid' : 'partial'

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      customers: [],
      orders: [],
      items: [],
      payments: [],
      settings: seedSettings,
      addOrUpdateCustomer: (input) => {
        const normalizedPhone = (input.phone || '').replace(/\D/g, '')
        const hasPhone = normalizedPhone.length >= 7

        // 1. If explicit ID provided, find and update by ID
        if (input.id) {
          const existingById = get().customers.find((customer) => customer.id === input.id)
          if (existingById) {
            const updated: Customer = {
              ...existingById,
              name: input.name?.trim() || existingById.name,
              phone: input.phone !== undefined ? input.phone.trim() : existingById.phone,
              address: input.address !== undefined ? input.address.trim() : existingById.address,
            }
            set((state) => ({
              customers: state.customers.map((c) => (c.id === existingById.id ? updated : c)),
            }))
            return updated
          }
        }

        // 2. If phone is provided, match by phone
        if (hasPhone) {
          const existingByPhone = get().customers.find(
            (customer) => customer.phone.replace(/\D/g, '') === normalizedPhone,
          )
          if (existingByPhone) {
            const updated: Customer = {
              ...existingByPhone,
              name: input.name?.trim() || existingByPhone.name,
              phone: input.phone.trim(),
              address: input.address?.trim() || existingByPhone.address,
            }
            set((state) => ({
              customers: state.customers.map((c) => (c.id === existingByPhone.id ? updated : c)),
            }))
            return updated
          }
        }

        // 3. Fallback: match by non-empty name if phone is not present
        const trimmedName = (input.name || '').trim()
        if (trimmedName && !hasPhone) {
          const existingByName = get().customers.find(
            (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase() && !c.phone.replace(/\D/g, ''),
          )
          if (existingByName) {
            const updated: Customer = {
              ...existingByName,
              address: input.address?.trim() || existingByName.address,
            }
            set((state) => ({
              customers: state.customers.map((c) => (c.id === existingByName.id ? updated : c)),
            }))
            return updated
          }
        }

        // 4. Create new customer
        const fallbackName = trimmedName || (input.phone?.trim() ? `Customer (${input.phone.trim()})` : input.address?.trim() ? `Customer (${input.address.trim().slice(0, 20)})` : 'Walk-in Customer')
        const customer: Customer = {
          id: id(),
          name: fallbackName,
          phone: input.phone?.trim() || '',
          address: input.address?.trim() || '',
          totalDue: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ customers: [customer, ...state.customers] }))
        return customer
      },
      updateCustomer: (idToUpdate, patch) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === idToUpdate
              ? {
                  ...customer,
                  name: patch.name !== undefined ? patch.name.trim() : customer.name,
                  phone: patch.phone !== undefined ? patch.phone.trim() : customer.phone,
                  address: patch.address !== undefined ? patch.address.trim() : customer.address,
                }
              : customer,
          ),
        }))
      },
      createOrder: ({ customer: customerInput, deliveryDate, paidAmount, notes, items }) => {
        const customer = get().addOrUpdateCustomer(customerInput)
        const orderNumber = get().settings.nextOrderNumber
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        const orderId = id()
        const now = new Date()
        const nowIso = now.toISOString()
        const orderTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        const order: Order = {
          id: orderId,
          orderNumber,
          customerId: customer.id,
          receiptDate: todayIso(),
          orderTime,
          deliveryDate:
            deliveryDate ||
            calculateDeliveryDate(get().settings.deliveryOffsetDays, get().settings.sundayClosed),
          totalAmount,
          paidAmount,
          dueAmount: Math.max(totalAmount - paidAmount, 0),
          paymentStatus: paymentStatus(paidAmount, totalAmount),
          status: 'pending',
          notes,
          createdAt: nowIso,
        }
        const orderItems: Item[] = items.map((item, index) => ({
          id: id(),
          orderId,
          itemNo: index + 1,
          ...item,
          totalPrice: item.quantity * item.unitPrice,
          tagCode: `${orderNumber}-${index + 1}`,
          isDelivered: false,
          deliveredAt: undefined,
        }))
        const initialPayment: Payment | undefined =
          paidAmount > 0
            ? {
                id: id(),
                customerId: customer.id,
                amountPaid: paidAmount,
                ordersCovered: [order.id],
                paymentMethod: 'cash',
                createdAt: nowIso,
              }
            : undefined
        set((state) => ({
          orders: [order, ...state.orders],
          items: [...orderItems, ...state.items],
          payments: initialPayment ? [initialPayment, ...state.payments] : state.payments,
          customers: state.customers.map((entry) =>
            entry.id === customer.id ? { ...entry, totalDue: entry.totalDue + order.dueAmount } : entry,
          ),
          settings: { ...state.settings, nextOrderNumber: orderNumber >= 10000 ? 1 : orderNumber + 1 },
        }))
        return order
      },
      updateOrderStatus: (orderId, status, handover) => {
        const nowIso = new Date().toISOString()
        set((state) => {
          const updatedOrders = state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  deliveredAt: status === 'delivered' ? order.deliveredAt ?? nowIso : undefined,
                  deliveredBy: status === 'delivered' ? handover?.deliveredBy || order.deliveredBy : undefined,
                  deliveryNote: status === 'delivered' ? handover?.deliveryNote || order.deliveryNote : undefined,
                }
              : order,
          )

          let updatedItems = state.items
          if (status === 'delivered') {
            updatedItems = state.items.map((item) =>
              item.orderId === orderId
                ? {
                    ...item,
                    isDelivered: true,
                    deliveredAt: item.deliveredAt ?? nowIso,
                    deliveredBy: handover?.deliveredBy || item.deliveredBy || 'Staff',
                  }
                : item,
            )
          }

          return {
            orders: updatedOrders,
            items: updatedItems,
          }
        })
      },
      toggleItemDelivery: (itemId, deliveredBy) => {
        const nowIso = new Date().toISOString()
        set((state) => {
          const target = state.items.find((item) => item.id === itemId)
          if (!target) return state

          const willBeDelivered = !target.isDelivered
          const updatedItem: Item = {
            ...target,
            isDelivered: willBeDelivered,
            deliveredAt: willBeDelivered ? nowIso : undefined,
            deliveredBy: willBeDelivered ? (deliveredBy || 'Staff') : undefined,
          }

          const nextItems = state.items.map((item) => (item.id === itemId ? updatedItem : item))
          const orderItems = nextItems.filter((item) => item.orderId === target.orderId)
          const allDelivered = orderItems.length > 0 && orderItems.every((item) => item.isDelivered)

          const nextOrders = state.orders.map((order) => {
            if (order.id !== target.orderId) return order

            if (allDelivered) {
              return {
                ...order,
                status: 'delivered' as OrderStatus,
                deliveredAt: order.deliveredAt ?? nowIso,
                deliveredBy: order.deliveredBy || deliveredBy || 'Staff',
              }
            } else if (order.status === 'delivered') {
              return {
                ...order,
                status: 'ready' as OrderStatus,
                deliveredAt: undefined,
              }
            }
            return order
          })

          return {
            items: nextItems,
            orders: nextOrders,
          }
        })
      },
      recordPayment: ({ customerId, amountPaid, ordersCovered, paymentMethod }) => {
        const payment: Payment = {
          id: id(),
          customerId,
          amountPaid,
          ordersCovered,
          paymentMethod,
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          let remaining = amountPaid
          const updatedOrders = [...state.orders]
          for (const orderId of ordersCovered) {
            if (remaining <= 0) break
            const index = updatedOrders.findIndex((order) => order.id === orderId)
            const order = updatedOrders[index]
            if (!order || order.dueAmount <= 0) continue
            const applied = Math.min(order.dueAmount, remaining)
            remaining -= applied
            const paidAmount = order.paidAmount + applied
            const dueAmount = Math.max(order.totalAmount - paidAmount, 0)
            updatedOrders[index] = { ...order, paidAmount, dueAmount, paymentStatus: paymentStatus(paidAmount, order.totalAmount) }
          }
          const totalApplied = amountPaid - remaining
          return {
            payments: [payment, ...state.payments],
            orders: updatedOrders,
            customers: state.customers.map((customer) =>
              customer.id === customerId
                ? { ...customer, totalDue: Math.max(customer.totalDue - totalApplied, 0) }
                : customer,
            ),
          }
        })
      },
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      replaceData: (backup) => set(() => ({
        customers: backup.customers,
        orders: backup.orders,
        items: backup.items,
        payments: backup.payments,
        settings: { ...seedSettings, ...backup.settings },
      })),
    }),
    {
      name: 'paul-drycleaners-store',
      storage: folderStorage,
      onRehydrateStorage: () => (state) => {
        if (state) void folderStorage.setItem('paul-drycleaners-store', { state, version: 0 })
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ShopState> | undefined
        return {
          ...currentState,
          ...persisted,
          settings: {
            ...seedSettings,
            ...(persisted?.settings ?? {}),
            receiptOffsets: {
              ...seedSettings.receiptOffsets,
              ...(persisted?.settings?.receiptOffsets ?? {}),
            },
            localUsers: {
              ...seedSettings.localUsers,
              ...(persisted?.settings?.localUsers ?? {}),
            },
            serviceTypes:
              persisted?.settings?.serviceTypes?.map((service) => (service === 'Press' ? 'Steam Press' : service)) ??
              (Object.keys((persisted?.settings as Settings & { servicePrices?: Record<string, number> })?.servicePrices ?? {})
                .map((service) => (service === 'Press' ? 'Steam Press' : service))
                .filter(Boolean).length
                ? Object.keys((persisted?.settings as Settings & { servicePrices?: Record<string, number> })?.servicePrices ?? {})
                    .map((service) => (service === 'Press' ? 'Steam Press' : service))
                : seedSettings.serviceTypes),
            garmentTypes: [...new Set([...seedSettings.garmentTypes, ...(persisted?.settings?.garmentTypes ?? []).filter((type) => !['Shirt', 'Suit'].includes(type))])],
            quickAddItems: [...new Set((persisted?.settings?.quickAddItems ?? seedSettings.quickAddItems).filter(Boolean))],
            garmentPrices: {
              ...Object.fromEntries(Object.entries(persisted?.settings?.garmentPrices ?? {}).filter(([name]) => !['Shirt', 'Suit', 'Saree', 'Pant'].includes(name))),
              ...seedSettings.garmentPrices,
            },
          },
        }
      },
    },
  ),
)
