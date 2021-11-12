import request from 'supertest';
import { app } from '../../app';
import { SIGNOUT_API, SIGNUP_API } from '../../api-constants';
import { CLEARED_COOKIE, EMAIL_VALID, PASSWORD_VALID } from './constants';

it('clears the cookie after signout', async () => {
  await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);

  const res = await request(app).post(SIGNOUT_API).send({}).expect(200);

  expect(res.get('Set-Cookie')[0]).toEqual(CLEARED_COOKIE);
});
