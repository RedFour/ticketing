import { OrderCancelledEvent, Publisher, Subjects } from '@ddytickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
