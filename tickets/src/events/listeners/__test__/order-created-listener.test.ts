import TicketModel from '../../../models/ticket';
import { natsService } from '../../../services/nats-service';
import { OrderCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@ddytickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsService.client);

  // Create and save a ticket
  const ticket = TicketModel.build({
    title: 'concert',
    price: 10,
    userId: 'asdf',
  });

  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdf',
    expiresAt: 'asdf',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, message };
};

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await TicketModel.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(natsService.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsService.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
