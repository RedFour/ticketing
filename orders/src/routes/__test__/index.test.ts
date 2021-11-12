import request from 'supertest';
import { ORDERS_API } from '../../api-constants';
import { app } from '../../app';
import { getAuthCookie } from '../../test/signup-helper';
import { createTicket } from '../../test/ticket-helpers';

it('has a route handler listening to /api/orders for get requests', async () => {
  const response = await request(app).get(ORDERS_API).send({});

  expect(response.status).not.toEqual(404);
});

it('Return a 401 if not authenticated and attempts a get request', async () => {
  const response = await request(app).get(ORDERS_API).send({});

  expect(response.status).toEqual(401);
});

it('Returns orders for a particular user', async () => {
  // Create three tickets
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = await getAuthCookie('userOne');
  const userTwo = await getAuthCookie('userTwo');

  // Create one order as User #1
  await request(app)
    .post(ORDERS_API)
    .set('Cookie', [userOne])
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [userTwo])
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post(ORDERS_API)
    .set('Cookie', [userTwo])
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get(ORDERS_API)
    .set('Cookie', [userTwo])
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
