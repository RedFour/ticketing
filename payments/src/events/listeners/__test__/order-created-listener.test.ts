import { natsService } from './../../../services/nats-service';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@ddytickets/common';
import mongoose from 'mongoose';
import { Order } from '../../../model/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsService.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'asdf',
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10,
    },
  };

  // create a fake message
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  // write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});

it('creates an order and saves in mongodb', async () => {
  const { listener, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});
