import request from 'supertest';
import { ORDERS_API } from '../../api-constants';
import { app } from '../../app';
import { getAuthCookie } from '../../test/signup-helper';
import { createTicket } from '../../test/ticket-helpers';
import mongoose from 'mongoose';

it('Return a 401 if not authenticated and attempts a get request', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app).get(`${ORDERS_API}/${orderId}`).send({});

  expect(response.status).toEqual(401);
});

it('Fetches the order', async () => {
  // Create a ticket
  const ticket = await createTicket();

  const user = await getAuthCookie();
  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [user])
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`${ORDERS_API}/${order.id}`)
    .set('Cookie', [user])
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('Returns an error if one user tries to fetch another user order', async () => {
  // Create a ticket
  const ticket = await createTicket();

  const userOne = await getAuthCookie();
  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [userOne])
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make request to fetch the order as a different user
  const userTwo = await getAuthCookie('userTwo');
  const { body: fetchedOrder } = await request(app)
    .get(`${ORDERS_API}/${order.id}`)
    .set('Cookie', [userTwo])
    .send()
    .expect(401);
});
