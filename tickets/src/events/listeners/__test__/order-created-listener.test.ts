import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent, OrderStatus } from '@leintickets/common'
import  mongoose  from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const ticket = Ticket.build({
    title: 'concerts',
    price: 200,
    userId: 'user123'
  });

  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'user1234',
    expiresAt: 'ssfhkfj,asf',
    ticket: {
        id: ticket.id,
        price: ticket.price
    }
  }
  // @ts-ignore
  const msg:Message = {
    ack: jest.fn()
  }
  return { data, msg, listener, ticket}
}


it('sets the userId of the ticket', async () => {
  const { data, msg, listener, ticket} = await setup()

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { data, msg, listener, ticket} = await setup()

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { data, msg, listener, ticket} = await setup()

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
  
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

  expect(ticketUpdatedData.orderId).toEqual(data.id)
})