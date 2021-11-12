import request from 'supertest';
import { app } from '../../app';
import { SIGNIN_API, SIGNUP_API } from '../../api-constants';
import {
  EMAIL_INVALID,
  PASSWORD_VALID,
  EMAIL_VALID,
  PASSWORD_INVALID,
} from './constants';

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post(SIGNIN_API)
    .send({
      email: EMAIL_INVALID,
      password: PASSWORD_VALID,
    })
    .expect(400);
});

it('fails when a email does not exist is supplied', async () => {
  await request(app)
    .post(SIGNIN_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);

  await request(app)
    .post(SIGNIN_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_INVALID,
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);

  const res = await request(app)
    .post(SIGNIN_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});
