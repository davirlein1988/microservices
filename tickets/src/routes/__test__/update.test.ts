import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper"
import { Ticket } from "../../models/ticket";

it("return a 404 if the provided id does not exist", async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.getCookie())
    .send({
      title: "valid title",
      price: 25
    })
    .expect(404);
})

it("return a 401 if the user is not authenticated", async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "valid title",
      price: 25
    })
    .expect(401);
})
it("return a 401 if the user does not own the ticket", async () => {
  const title = 'concert';
  const price = 20;

  const rs = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.getCookie())
    .send({
      title,
      price,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${rs.body.id}`)
    .set("Cookie", global.getCookie())
    .send({
      title: "valid title",
      price: 2500
    })
    .expect(401);
})
it("return a 40 if user provides an invalid title or price", async () => {
  const title = 'concert';
  const price = 20;
  const cookie = global.getCookie()

  const rs = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title,
      price,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${rs.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "",
      price: 2500
    })
    .expect(400);
    await request(app)
    .put(`/api/tickets/${rs.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "a valid title",
      price: -10
    })
    .expect(400);
})
it("undates a tickets when providing valid inputs", async () => {
  const title = 'concert';
  const price = 20;
  const cookie = global.getCookie()

  const rs = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title,
      price,
    })
    .expect(201);
  await request(app)
    .put(`/api/tickets/${rs.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "a valid title",
      price: 100
    })
    .expect(200);
  const responseticket = await request(app)
    .get(`/api/tickets/${rs.body.id}`)
    .send()
    .expect(200);
  expect(responseticket.body.title).toEqual('a valid title');
  expect(responseticket.body.price).toEqual(100);
})


it("publishes an event", async ()=> {
  const title = 'concert';
  const price = 20;
  const cookie = global.getCookie()

  const rs = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title,
      price,
    })
    .expect(201);
  await request(app)
    .put(`/api/tickets/${rs.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "a valid title",
      price: 100
    })
    .expect(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates on reserved tickets', async ()=> {
  const title = 'concert';
  const price = 20;
  const cookie = global.getCookie()

  const rs = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title,
      price,
    })
    .expect(201);
  const ticket = await Ticket.findById(rs.body.id)

  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString()})

  await ticket!.save()
  await request(app)
    .put(`/api/tickets/${rs.body.id}`)
    .set("Cookie",cookie)
    .send({
      title: "a valid title",
      price: 100
    })
    .expect(400);
})

