import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ENV_JWT_KEY, ENV_NODE_ENV } from './test-constants';

jest.mock('../services/nats-service');

let mongo: any;

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
