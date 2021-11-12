import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { natsService } from './services/nats-service';
import mongoose from 'mongoose';
import { app } from './app';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const PORT = '3000';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

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
    new OrderCancelledListener(natsService.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(PORT, () => {
    console.log(`Tickets server is listening on ${PORT}`);
  });
};

start();
