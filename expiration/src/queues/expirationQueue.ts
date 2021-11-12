import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsService } from '../services/nats-service';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log(
    'I want to publish an expiration:complete event for orderId: ',
    job.data.orderId
  );

  new ExpirationCompletePublisher(natsService.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
