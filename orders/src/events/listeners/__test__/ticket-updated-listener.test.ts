import { TicketUpdatedEvent } from '@ddytickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsService } from './../../../services/nats-service';

const setup = async () => {
  // create instance of the listener
  const listener = new TicketUpdatedListener(natsService.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });

  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 999,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, message };
};

it('finds, updates, and saves a ticket', async () => {
  const { listener, ticket, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(ticket.id);

  // write assertions to make sure a ticket was updated
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  // write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});

it('does not ack if version number is wrong', async () => {
  const { listener, ticket, data, message } = await setup();
  data.version += 10;

  await expect(listener.onMessage(data, message)).rejects.toThrow();
  expect(message.ack).toHaveBeenCalledTimes(0);
});
