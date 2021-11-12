import { OrderCancelledEvent, OrderStatus } from '@ddytickets/common';
import { natsService } from '../../../services/nats-service';
import { OrderCancelledListener } from '../order-cancelled-listener';
import mongoose from 'mongoose';
import { Order } from '../../../model/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsService.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
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

it('cancells an order and saves in mongodb', async () => {
  const { listener, data, message } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, message);

  const updatedOrder = await Order.findById(data.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
