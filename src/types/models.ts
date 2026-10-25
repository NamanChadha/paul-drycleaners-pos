export type OrderStatus = 'pending' | 'ready' | 'delivered'
export type PaymentStatus = 'paid' | 'partial' | 'unpaid'
export type UserRole = 'admin' | 'reception'

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  totalDue: number
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: number
  customerId: string
  receiptDate: string
  orderTime?: string
  deliveryDate: string
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: PaymentStatus
  status: OrderStatus
  deliveredAt?: string
  deliveredBy?: string
  deliveryNote?: string
  notes: string
  createdAt: string
}

export interface Item {
  id: string
  orderId: string
  itemNo: number
  garmentType: string
  serviceType: string
  quantity: number
  unitPrice: number
  totalPrice: number
  tagCode: string
  isDelivered?: boolean
  deliveredAt?: string
  deliveredBy?: string
}

export interface Payment {
  id: string
  customerId: string
  amountPaid: number
  ordersCovered: string[]
  paymentMethod: string
  createdAt: string
}

export interface Settings {
  shopName: string
  address: string
  phone: string
  deliveryOffsetDays: number
  sundayClosed: boolean
  serviceTypes: string[]
  garmentPrices: Record<string, number>
  garmentTypes: string[]
  quickAddItems: string[]
  nextOrderNumber: number
  receiptOffsets: {
    top: number
    left: number
  }
  localUsers: {
    admin: { username: string; password: string }
    reception: { username: string; password: string }
  }
}
