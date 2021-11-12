// import { OrderStatus } from '@ddytickets/common';

export interface Order {
  id: string;
  userId: string;
  status: string;
  expiresAt: Date;
  ticket: OrderTicket;
  version: number;
}

export interface OrderTicket {
  title: string;
  price: number;
  isReserved: boolean;
  version: number;
}
