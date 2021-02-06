import request from "supertest";
import { app } from "../../app";

it("fails with eamil that does not exist", async () => {
  return request(app)
  .post("/api/users/signin")
  .send({
    email: "email@email.com",
    password: "password"
  })
  .expect(400)
})

it("fails with incorrect account password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201)
  await request(app)
  .post("/api/users/signin")
  .send({
    email: "test@test.com",
    password: "pass123"
  })
  .expect(400)
})

it("responds with a cookie when provided valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201)
  const response = await request(app)
  .post("/api/users/signin")
  .send({
    email: "test@test.com",
    password: "password"
  })
  .expect(200)
  expect(response.get("Set-Cookie")).toBeDefined()
})