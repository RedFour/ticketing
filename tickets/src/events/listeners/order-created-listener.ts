import { queueGroupName } from './../queue-group-name';
import {
  Listener,
  NotFoundError,
  OrderCreatedEvent,
  Subjects,
} from '@ddytickets/common';
import { Message } from 'node-nats-streaming';
import TicketModel from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], message: Message) {
    const ticket = await TicketModel.findById(data.ticket.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.set({ orderId: data.id });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    message.ack();
  }
}
