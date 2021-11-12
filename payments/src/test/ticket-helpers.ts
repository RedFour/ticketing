import request from 'supertest';
import { TICKETS_API } from '../api-constants';
import { app } from '../app';
import { getAuthCookie } from './signup-helper';
import { TITLE_VALID, PRICE_VALID } from './test-constants';

export const createTicket = async () => {
  return request(app)
    .post(TICKETS_API)
    .set('Cookie', [await getAuthCookie()])
    .send({
      title: TITLE_VALID,
      price: PRICE_VALID,
    });
};
