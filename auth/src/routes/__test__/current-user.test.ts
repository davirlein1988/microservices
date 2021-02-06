import request from "supertest";
import { app } from "../../app";

it("response with details of current user", async () => {
    const cookie = await global.getCookie();
    const response = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", cookie)
      .expect(200);

    expect(response.body.currentUser.email).toEqual("test@test.com")
});

it("responds with null when not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200)
  expect(response.body.currentUser).toEqual(null)
})