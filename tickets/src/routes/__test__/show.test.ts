import { getAuthCookie } from './../../test/signup-helper';
import { TITLE_VALID, PRICE_VALID } from './../../test/test-constants';
import { TICKETS_API } from './../../api-constants';
import request from 'supertest';
import { app } from '../../app';
import { TICKET_ID_INVALID } from '../../test/test-constants';
import mongoose from 'mongoose';

it('returns a 404 Not Found if a the ticket is not found', async () => {
  const objectId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(TICKETS_API + '/' + objectId)
    .send()
    .expect(404);
});

it('returns a 400 Bad Request if a the ticket id is invalid', async () => {
  await request(app)
    .get(TICKETS_API + '/' + TICKET_ID_INVALID)
    .send()
    .expect(400);
});

it('returns the ticket if a the ticket is found', async () => {
  const resCreateTicket = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    })
    .expect(201);

  const resTicket = await request(app)
    .get(TICKETS_API + '/' + resCreateTicket.body.id)
    .send()
    .expect(200);

  expect(resTicket.body.title).toEqual(TITLE_VALID);
  expect(resTicket.body.price).toEqual(PRICE_VALID);
});
