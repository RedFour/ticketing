import request from 'supertest';
import { TICKETS_API } from '../../api-constants';
import { app } from '../../app';
import mongoose from 'mongoose';
import { getAuthCookie } from '../../test/signup-helper';
import {
  PRICE_INVALID,
  PRICE_VALID,
  TITLE_INVALID,
  TITLE_VALID,
} from '../../test/test-constants';
import { natsService } from '../../services/nats-service';
import TicketModel from '../../models/ticket';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`${TICKETS_API}/${id}`)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`${TICKETS_API}/${id}`)
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const responseNewTicket = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    });

  const newUserId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`${TICKETS_API}/${responseNewTicket.body.id}`)
    .set('Cookie', [await getAuthCookie(newUserId)])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID + 10,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const responseNewTicket = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    });

  await request(app)
    .put(`${TICKETS_API}/${responseNewTicket.body.id}`)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_INVALID,
    })
    .expect(400);

  await request(app)
    .put(`${TICKETS_API}/${responseNewTicket.body.id}`)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_INVALID,
      price: PRICE_VALID,
    })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const resNewTicket = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    });

  const NEW_PRICE = PRICE_VALID + 10;
  const resUpdateTicket = await request(app)
    .put(`${TICKETS_API}/${resNewTicket.body.id}`)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: NEW_PRICE,
    })
    .expect(200);

  const resGetTicket = await request(app)
    .get(`${TICKETS_API}/${resNewTicket.body.id}`)
    .send();

  expect(resGetTicket.body.price).toEqual(NEW_PRICE);
});

it('publishes an event', async () => {
  const resNewTicket = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    });

  const NEW_PRICE = PRICE_VALID + 10;
  const resUpdateTicket = await request(app)
    .put(`${TICKETS_API}/${resNewTicket.body.id}`)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: NEW_PRICE,
    })
    .expect(200);

  expect(natsService.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const resNewTicket = await request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    });

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = await TicketModel.findById(resNewTicket.body.id);
  ticket!.set({ orderId: orderId });
  await ticket!.save();

  const NEW_PRICE = PRICE_VALID + 10;
  const resUpdateTicket = await request(app)
    .put(`${TICKETS_API}/${resNewTicket.body.id}`)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: NEW_PRICE,
    })
    .expect(400);
});
