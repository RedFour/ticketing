import { OrderCancelledListener } from './../order-cancelled-listener';
import TicketModel from '../../../models/ticket';
import { natsService } from '../../../services/nats-service';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@ddytickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsService.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  // Create and save a ticket
  const ticket = TicketModel.build({
    title: 'concert',
    price: 10,
    userId: 'asdf',
  });
  ticket.set({ orderId });
  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, message, orderId };
};

it('updates the ticket', async () => {
  const { listener, ticket, data, message } = await setup();

  await listener.onMessage(data, message);

  const updatedTicket = await TicketModel.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
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

  expect(ticketUpdatedData.orderId).not.toBeDefined();
});
