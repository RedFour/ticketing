import { Order } from '../../../models/order';
import { natsService } from '../../../services/nats-service';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { ExpirationCompleteEvent, OrderStatus } from '@ddytickets/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create instance of the listener
  const listener = new ExpirationCompleteListener(natsService.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
  });
  await ticket.save();

  // Create and save a order
  const order = Order.build({
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket: ticket,
    userId: 'asdf',
  });
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // create a fake message
  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, message };
};

it('acks the message', async () => {
  const { listener, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  // write assertions to make sure ack function is called
  expect(message.ack).toHaveBeenCalled();
});

it('Updates order to cancelled and emits an OrderCancelled event', async () => {
  const { listener, data, order, message } = await setup();
  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

  expect(natsService.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsService.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});
