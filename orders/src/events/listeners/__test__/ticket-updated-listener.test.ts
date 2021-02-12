import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from "@leintickets/common"

import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from '../ticket-updated-listener';
const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client)
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 5000
  })

  await ticket.save();


  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: " new concert",
    price: 2000,
    userId: new mongoose.Types.ObjectId().toHexString()
  }
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { ticket,listener, data, msg}
}

it('finds updates and saves a ticket', async () => {
  const { ticket,listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if th ticket has a skipped version', async () => {
  const { listener, data, msg } = await setup()
  data.version = 10

  try {
    await listener.onMessage(data, msg)
  } catch (error) {
    
  }
  expect(msg.ack).not.toHaveBeenCalled()
})