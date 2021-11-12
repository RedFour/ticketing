import { OrderCreatedEvent, Publisher, Subjects } from '@ddytickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
