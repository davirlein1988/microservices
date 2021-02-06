import express, { Request, Response } from "express"

const router = express.Router();
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from '@leintickets/common';
import { User } from "../models/user";
import { Password } from '../services/password';


router.post("/api/users/signin", [
  body("email")
  .isEmail()
  .withMessage("Email must be valid"),
  body("password")
  .trim()
  .notEmpty()
  .withMessage("You must supply a password")
], validateRequest,
  async  (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email })
    
    if(!existingUser) {
      throw new BadRequestError("Invalid email or password")
    }
    
    const passwordMatch = await Password.compare(existingUser.password, password);

    if(!passwordMatch) {
      throw new BadRequestError("Invalid eamil or password");
    }

    const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email,
  }, process.env.JWT_KEY!);

  req.session = {
    jwt: userJwt
  }
  res.status(200).send(existingUser);
});

export { router as signinRouter }