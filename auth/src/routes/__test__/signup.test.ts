import request from 'supertest';
import { app } from '../../app';
import { SIGNUP_API } from '../../api-constants';
import {
  EMAIL_VALID,
  PASSWORD_VALID,
  EMAIL_INVALID,
  PASSWORD_INVALID,
} from './constants';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_INVALID,
      password: PASSWORD_VALID,
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_INVALID,
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
    })
    .expect(400);

  await request(app)
    .post(SIGNUP_API)
    .send({
      password: PASSWORD_VALID,
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);

  await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(400);
});

it('sets a cookie after sucessful signup', async () => {
  const response = await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
