import { OrderStatus } from '@ddytickets/common';
import request from 'supertest';
import { ORDERS_API } from '../../api-constants';
import { app } from '../../app';
import { getAuthCookie } from '../../test/signup-helper';
import { createTicket } from '../../test/ticket-helpers';
import mongoose from 'mongoose';
import { natsService } from '../../services/nats-service';

it('Return a 401 if not authenticated and attempts a delete request', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .delete(`${ORDERS_API}/${orderId}`)
    .send({});

  expect(response.status).toEqual(401);
});

it('Cancels the order', async () => {
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
  const { body: cancelledOrder } = await request(app)
    .delete(`${ORDERS_API}/${order.id}`)
    .set('Cookie', [user])
    .send()
    .expect(200);

  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
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
  const { body: cancelledOrder } = await request(app)
    .delete(`${ORDERS_API}/${order.id}`)
    .set('Cookie', [user])
    .send()
    .expect(200);

  expect(natsService.client.publish).toHaveBeenCalledTimes(2);
});
