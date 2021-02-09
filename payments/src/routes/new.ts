import express, {Request, Response} from "express"
import { body } from "express-validator"
import {requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus} from "@leintickets/common"
import { Order } from "../models/order"
import { stripe } from '../stripe';
import { Payment } from "../models/payments";
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post('/api/payments', requireAuth, [
  body('token').not().isEmpty().withMessage('token is required'),
  body('orderId').not().isEmpty().withMessage('orderId is required')
], validateRequest, async (req: Request, res: Response) => {
  const { token, orderId } = req.body;

  const order = await Order.findById(orderId)

  if(!order) {
    throw new NotFoundError()
  }
  if(order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError("Cannot place this order")
  }

  if(order.status === OrderStatus.Cancelled) {
    throw new BadRequestError("Cannot pay for a cancelled order")
  }
  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token
  })
  // uses a fallback because stripe is not setup in my country
  const payment = Payment.build({
    orderId,
    stripeId: charge.id || "sk_test_3RuIWjTJGE4yBYQrCrKAhi1900X2wn6QV9"
  })
  await payment.save()
  new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId
  })
  res.status(201).send(payment)
})

export { router as createChargeRouter }