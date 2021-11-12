import request from 'supertest';
import { ORDERS_API } from '../../api-constants';
import { app } from '../../app';
import { getAuthCookie } from '../../test/signup-helper';
import {
  PRICE_VALID,
  TICKET_ID_INVALID,
  TITLE_VALID,
  USER_ID,
} from '../../test/test-constants';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsService } from '../../services/nats-service';
import { createTicket } from '../../test/ticket-helpers';

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post(ORDERS_API).send({});

  expect(response.status).not.toEqual(404);
});

it('Return a 401 if not authenticated and attempts a post request', async () => {
  const response = await request(app).post(ORDERS_API).send({});

  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if user is signed in', async () => {
  const res = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({});

  expect(res.status).not.toEqual(401);
});

it('returns an error 400 status if an invalid ticketId is provided', async () => {
  const res = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      ticketId: TICKET_ID_INVALID,
    })
    .expect(400);
});

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post(ORDERS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      ticketId: ticketId,
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  // create ticket
  const ticket = await createTicket();

  // create order
  const order = Order.build({
    ticket,
    userId: USER_ID,
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  // try to reserve ticket
  const res = request(app)
    .post(ORDERS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it('reserves a ticket', async () => {
  // create ticket
  const ticket = await createTicket();

  // try to reserve ticket
  const res = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it('emits an order created event', async () => {
  // create ticket
  const ticket = await createTicket();

  // try to reserve ticket
  const res = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsService.client.publish).toHaveBeenCalled();
});
