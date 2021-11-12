import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { ORDERS_API } from './../api-constants';
import express, { Request, Response } from 'express';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@ddytickets/common';
import { Order, OrderStatus } from '../models/order';
import { natsService } from '../services/nats-service';

const router = express.Router();

router.delete(
  `${ORDERS_API}/:orderId`,
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publish an event saying this was cancelled
    new OrderCancelledPublisher(natsService.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as deleteOrderRouter };
