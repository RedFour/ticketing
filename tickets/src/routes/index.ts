import express, { Request, Response } from 'express';
import { TICKETS_API } from '../api-constants';
import TicketModel from '../models/ticket';

const router = express.Router();

router.get(TICKETS_API, async (req: Request, res: Response) => {
  const tickets = await TicketModel.find({
    orderId: undefined,
  });

  res.send(tickets);
});

export { router as indexTicketRouter };
