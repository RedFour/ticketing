import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@ddytickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], message: Message) {
    // Create ticket in Order Serivce's mongodb
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
    });
    await ticket.save();

    message.ack();
  }
}
