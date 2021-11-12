import { validateRequest, NotFoundError } from '@ddytickets/common';
import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import { TICKETS_API } from '../api-constants';
import TicketModel from '../models/ticket';

const router = express.Router();

router.get(
  `${TICKETS_API}/:id`,
  param('id').isMongoId().withMessage('Id must be a valid MongoDB ObjectId'),
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await TicketModel.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.send(ticket);
  }
);

export { router as showTicketRouter };
