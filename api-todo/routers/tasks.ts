import express from 'express';
import mongoose, { Types } from 'mongoose';
import auth, { RequestWithUser } from '../middleware/auth';
import Task from '../models/Task';
import { TaskMutation } from '../types';

const tasksRouter = express.Router();

tasksRouter.post('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    let _id: Types.ObjectId;
    try {
      _id = new Types.ObjectId(req.user?._id);
    } catch {
      return res.status(404).send({ error: 'Wrong ObjectId!' });
    }

    const taskData: TaskMutation = {
      user: _id,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    };

    const task = new Task(taskData);
    await task.save();

    res.send(task);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(422).send(e);
    }

    next(e);
  }
});

tasksRouter.get('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    let _id: Types.ObjectId;
    try {
      _id = new Types.ObjectId(req.user?._id);
    } catch {
      return res.status(404).send({ error: 'Wrong ObjectId!' });
    }

    const task = await Task.find({ user: _id });
    res.send(task);
  } catch (e) {
    next(e);
  }
});

export default tasksRouter;
