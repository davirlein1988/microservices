import request from "supertest"
import mongoose from "mongoose"
import { app } from "../../app"
import { Order } from "../../models/order"
import {OrderStatus} from "@leintickets/common"
import { stripe } from "../../stripe"
import { Payment } from "../../models/payments"

jest.mock("../../stripe")

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app).post('/api/payments').set("Cookie", global.getCookie()).send({
    token: "asdfg",
    orderId: mongoose.Types.ObjectId().toHexString()
  }).expect(404)
})

it("returns a 401 when purcahsing an order that does not belong to user", async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  })

  await order.save()

  await request(app).post('/api/payments').set("Cookie", global.getCookie()).send({
    token: "asdfg",
    orderId: order.id
  }).expect(401)
})

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  })

  await order.save()
  await request(app).post('/api/payments').set("Cookie", global.getCookie(userId)).send({
    token: "asdfg",
    orderId: order.id
  }).expect(400)
})
it("returns a 204 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created
  })

  await order.save()
  await request(app).post("/api/payments")
  .set("Cookie", global.getCookie(userId))
  .send({
    token: 'tok_visa',
    orderId: order.id
  }).expect(201)

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]

  expect(chargeOptions.source).toEqual('tok_visa')
  expect(chargeOptions.amount).toEqual(20 * 100)
  expect(chargeOptions.currency).toEqual('usd')

  const payment = Payment.findOne({
    orderId: order.id,
    stripeId: chargeOptions.id
  })

  expect(payment).not.toBeNull()
})