import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import { ENV_JWT_KEY, ENV_NODE_ENV } from './test-constants';

jest.mock('../services/nats-service');

let mongo: any;

process.env.STRIPE_KEY =
  'sk_test_51JmoxsFIxrzuxJPm22MqUjTQlGMjf5Z7epD9pIm1x6h2In8KAIi6GyvLHVlzzv0GSxuGnc0OqEHwiqfGmXI2w5PN00KcaJA6F0';

beforeAll(async () => {
  process.env.JWT_KEY = ENV_JWT_KEY;
  process.env.NODE_ENV = ENV_NODE_ENV;

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
