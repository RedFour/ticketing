import { getAuthCookie } from './../../test/signup-helper';
import request from 'supertest';
import { TICKETS_API } from '../../api-constants';
import { app } from '../../app';
import {
  PRICE_INVALID,
  PRICE_VALID,
  TITLE_INVALID,
  TITLE_VALID,
} from '../../test/test-constants';
import TicketModel from '../../models/ticket';
import { natsService } from '../../services/nats-service';

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post(TICKETS_API).send({});

  expect(response.status).not.toEqual(404);
});

it('returns a 401 status if user is not signed in', async () => {
  const response = await request(app).post(TICKETS_API).send({}).expect(401);
});

it('returns a status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_INVALID,
      price: PRICE_VALID,
    })
    .expect(400);

  await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      price: PRICE_VALID,
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_INVALID,
    })
    .expect(400);

  await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await TicketModel.find({});
  expect(tickets.length).toEqual(0);

  const res = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    })
    .expect(201);

  tickets = await TicketModel.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(TITLE_VALID);
  expect(tickets[0].price).toEqual(PRICE_VALID);
});

it('publishes an event', async () => {
  const res = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    })
    .expect(201);

  expect(natsService.client.publish).toHaveBeenCalled();
});
