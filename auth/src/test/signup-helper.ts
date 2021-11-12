import { EMAIL_VALID, PASSWORD_VALID } from '../routes/__test__/constants';
import { SIGNUP_API } from '../api-constants';
import request from 'supertest';
import { app } from '../app';

export const signup = async () => {
  const signupResponse = await request(app)
    .post(SIGNUP_API)
    .send({
      email: EMAIL_VALID,
      password: PASSWORD_VALID,
    })
    .expect(201);

  const cookie = signupResponse.get('Set-Cookie');

  return cookie;
};
