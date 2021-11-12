import { PAYMENTS_API } from './../../api-constants';
import request from 'supertest';
import { app } from '../../app';
import { getAuthCookie } from '../../test/signup-helper';
import mongoose from 'mongoose';
import { Order } from '../../model/order';
import { OrderStatus } from '@ddytickets/common';
import { stripe } from '../../services/stripe-service';
import { Payment } from '../../model/payment';

jest.mock('../../services/stripe-service');

it('returns a 404 if order is not found', async () => {
  const response = await request(app)
    .post(PAYMENTS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      token: 'asdf',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 order userId does not match currentUserId', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  await request(app)
    .post(PAYMENTS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      token: 'asdf',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 if order status is cancelled', async () => {
  const user = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Cancelled,
    userId: user,
    version: 0,
  });
  await order.save();

  await request(app)
    .post(PAYMENTS_API)
    .set('Cookie', [await getAuthCookie(user)])
    .send({
      token: 'asdf',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const user = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
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

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(10 * 100);
  expect(chargeOptions.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    // stripeId: chargeOptions!.id,
  });

  console.log(payment);
  expect(payment).not.toBeNull();
});
