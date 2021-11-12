import { Subjects, Publisher, PaymentCreatedEvent } from '@ddytickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
