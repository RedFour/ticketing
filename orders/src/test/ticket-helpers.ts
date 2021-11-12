import { Ticket } from '../models/ticket';
import { TITLE_VALID, PRICE_VALID } from './test-constants';
import mongoose from 'mongoose';

export const createTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: TITLE_VALID,
    price: PRICE_VALID,
  });
  await ticket.save();

  return ticket;
};
