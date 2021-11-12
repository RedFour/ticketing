import request from 'supertest';
import mongoose from 'mongoose';
import { Order } from '../../model/order';
import { OrderStatus } from '@ddytickets/common';
import { PAYMENTS_API } from '../../api-constants';
import { app } from '../../app';
import { getAuthCookie } from '../../test/signup-helper';
import { stripe } from '../stripe-service';

it.skip('correctly connects with stripe service and creates a charge', async () => {
  const user = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: price,
    status: OrderStatus.Created,
    userId: user,
    version: 0,
  });
  await order.save();

  await request(app)
    .post(PAYMENTS_API)
    .set('Cookie', [await getAuthCookie(user)])
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');
});
