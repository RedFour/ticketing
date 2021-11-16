import { currentUser } from '@ddytickets/common';
import { CURRENT_USER_API } from '../../api-constants';
import request from 'supertest';
import { app } from '../../app';
import { SIGNIN_API, SIGNUP_API } from '../../api-constants';
import { PASSWORD_VALID, EMAIL_VALID } from './constants';
import { signup } from '../../test/signup-helper';

it('responds with details about the current user', async () => {
  const cookie = await signup();

  const res = await request(app)
    .get(CURRENT_USER_API)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(res.body.currentUser.email).toEqual(EMAIL_VALID);
});

it('responds with null if not authenticated', async () => {
  const res = await request(app).get(CURRENT_USER_API).send().expect(200);

  expect(res.body.currentUser).toBeNull();
});
