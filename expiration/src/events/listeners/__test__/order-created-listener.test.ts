import { natsService } from '../../../services/nats-service';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@ddytickets/common';
import { expirationQueue } from '../../../queues/expirationQueue';

const setup = async () => {
  const listener = new OrderCreatedListener(natsService.client);

  const data: OrderCreatedEvent['data'] = {
    id: 'asdf',
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdf',
    expiresAt: Date(),
    ticket: {
      id: 'asdf',
      price: 200,
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

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});

it('enqueue a job upon receiving order created event', async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(expirationQueue.add).toHaveBeenCalled();
});
