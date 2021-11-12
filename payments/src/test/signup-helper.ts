import jwt from 'jsonwebtoken';

import { USER_ID, EMAIL } from './test-constants';

export const getAuthCookie = async (id?: string, email?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id || USER_ID,
    email: email || EMAIL,
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  const cookie = `express:sess=${base64}`;

  return cookie;
};
