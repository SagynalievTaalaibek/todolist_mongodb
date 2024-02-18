import { Model, Types } from 'mongoose';

export interface UserFields {
  username: string;
  password: string;
  token: string;
}

export interface UserI {
  _id: Types.ObjectId;
  username: string;
  password: string;
  token: string;
}

interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  generateToken(): void;
}

type UserModel = Model<UserFields, unknown, UserMethods>;

export interface TaskMutation {
  user: Types.ObjectId;
  title: string;
  description: string;
  status: string;
}

export interface TaskI {
  id: string;
  user: Types.ObjectId;
  title: string;
  description: string;
  status: string;
}
