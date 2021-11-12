import request from 'supertest';
import { TICKETS_API } from '../../api-constants';
import { app } from '../../app';
import { createTicket } from '../../test/ticket-helpers';

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get(TICKETS_API).send().expect(200);

  expect(response.body.length).toEqual(3);
});
