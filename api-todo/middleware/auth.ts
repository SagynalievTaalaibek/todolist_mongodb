import { NextFunction, Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';
import User from '../models/User';
import { UserI } from '../types';

export interface RequestWithUser extends Request {
  user?: HydratedDocument<UserI>;
}

const auth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const headerValue = req.get('Authorization');

  if (!headerValue) {
    return res.status(401).send({ error: 'No Authorization header present!' });
  }

  const [_bearer, token] = headerValue.split(' ');

  if (!token) {
    return res.status(401).send({ error: 'No token present!' });
  }

  const user = await User.findOne({ token });

  if (!user) {
    return res.status(401).send({ error: 'Wrong token!' });
  }

  req.user = user;
  next();
};

export default auth;
