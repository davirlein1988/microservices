import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose  from 'mongoose';
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../app";

declare global {
  namespace NodeJS {
    interface Global {
      getCookie(): string[]
    }
  }
}
jest.mock("../nats-wrapper");

let mongo: any;
beforeAll(async () => {
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();
  process.env.JWT_KEY = "ASDF"


  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for(let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async ()=> {
  await mongo.stop();
  await mongoose.connection.close();
});

global.getCookie =  () => {
  // build payload for JWT
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  }
  // create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //  build session onject
  const session = { jwt: token }
  // turn session into json
  const sessionJson = JSON.stringify(session)
  // take json and encode it as base64
  const base64 = Buffer.from(sessionJson).toString("base64")


  // return cookie with encoded data

  return [`express:sess=${base64}`]
}