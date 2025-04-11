// Base Types - These are the fundamental building blocks
export type BaseEntity = {
  id: number;
};

export type BaseNamedEntity = BaseEntity & {
  name: string;
};

// Customer Types
export type CustomerType = BaseNamedEntity & {
  email: string;
  phoneNumber?: string;
  dietaryRestrictions?: string;
  notes?: string;
};

export type CustomerFormData = Omit<CustomerType, 'id'>;

// Event Types
export type EventType = BaseEntity & {
  title: string;
  date: number;
  description?: string;
  imageUrl?: string;
};

// Ticket Types
export type TicketType = BaseEntity & {
  eventId: number;
  time: number;
  totalAvailable: number;
  totalSold: number;
  price?: number;
  description?: string;
};

export type CartTicketType = {
  eventContentfulId: string;
  ticketContentfulId: string;
  quantity: number;
};

// Purchase Types
export type PurchaseType = BaseEntity & {
  customerId: number;
  purchaseDate: number;
  paid: boolean;
  refundDate?: number | null;
};

export type PurchaseItemType = BaseEntity & {
  purchaseId: number;
  ticketId: number;
  quantity: number;
};

// Admin Types
export type AdminEvent = {
  id: number;
  title: string;
  date: number;
  ticketsAvailable: number;
  ticketsSold: number;
};

// Base purchase info that's common across different purchase views
export type BasePurchaseInfo = {
  purchaseId: number;
  customerId: number;
  quantity: number;
  paid: boolean;
  purchaseDate: number;
};

export type AdminPurchase = BasePurchaseInfo & {
  customerName: string;
  customerEmail: string;
  purchaseItemsId?: number;
  refundDate?: number | null;
  ticketId: number;
  dietaryRestrictions?: string;
  notes?: string;
};

export type TicketWithPurchases = {
  ticketId: number;
  ticketTime: number;
  name?: string;
  totalAvailable: number;
  totalSold: number;
  purchases: AdminPurchase[];
};

export type EventWithTickets = {
  id: number;
  title: string;
  date: number;
  tickets: TicketWithPurchases[];
};

export type CustomerPurchase = BasePurchaseInfo & {
  eventId: number;
  eventTitle: string;
  eventDate: number;
  ticketTime: number;
};

export type AdminCustomerDetails = CustomerType & {
  purchases: CustomerPurchase[];
};

// UI Types
export type ToastFunction = (message: string, options?: any) => void;

export type RefundToastFunction = (message: string, refundedQuantity?: number) => void;

export type StatusChangeFunction = (newStatus: boolean) => void;

// Legacy types from api.types.ts
export type PurchasedTickets = {
  eventContentfulId: string;
  ticketContentfulId: string;
  quantity: number;
};

export type GetTicketByIdAndEventProps = {
  ticketContentfulId: string;
  eventContentfulId: string;
};

export type DatabaseTickets = {
  ticket: {
    time: Date | null;
    // other properties...
  };
};

// Composite types
export type CompletePurchase = PurchaseType & {
  customer: CustomerType;
  items: Array<PurchaseItemType & {
    ticket: TicketType;
  }>;
};

export type EventWithTicketsType = EventType & {
  tickets: TicketType[];
};

// UI Component Types
export type NavLinkType = {
  name: string;
  path: string;
};

// Admin Types
export type AdminEventDetailsProps = {
  event: EventWithTickets;
  setRefundToast: RefundToastFunction;
};

// Form Types
export type CustomerFormProps = {
  initialData?: CustomerFormData;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onSuccess?: ToastFunction;
  onError?: ToastFunction;
};

// Table Types
export type EventsTableProps = {
  events: AdminEvent[] | undefined;
  handleEventClick: (eventId: number) => void;
};

// Layout Types
export type MainLayoutProps = {
  children: React.ReactNode;
  navLinks?: NavLinkType[];
};

// Add this to match the existing event type used in EventsTable
export type EventTableEvent = {
    id: number;
    name: string;
    date: Date;
    ticketsAvailable: number;
    ticketsSold: number;
}; 