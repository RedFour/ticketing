import { Publisher, Subjects, TicketUpdatedEvent } from '@ddytickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
