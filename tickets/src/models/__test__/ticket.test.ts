import { Ticket } from "../ticket";

it("implements concurrency control", async (done) => {
  const ticket = Ticket.build({
    title: "concerts",
    price: 200,
    userId: "123"
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);



  firstInstance?.set({ price: 20});
  secondInstance?.set({ price: 15});

  await firstInstance?.save();

  try {
    await secondInstance?.save();
  } catch (err) {
    return done();
  }
  throw new Error("Should not react here...")
});

it("increment the version on every update", async () => {
  const ticket = Ticket.build({
    title: "concerts",
    price: 200,
    userId: "123"
  });

  await ticket.save();

  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});