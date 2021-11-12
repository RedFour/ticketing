import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsService } from './services/nats-service';

const PORT = '3000';

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    await natsService.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsService.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => {
      natsService.client.close();
    });

    process.on('SIGTERM', () => {
      natsService.client.close();
    });

    new OrderCreatedListener(natsService.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
