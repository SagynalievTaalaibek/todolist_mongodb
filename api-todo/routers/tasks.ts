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

    const tasks = await Task.find({ user: _id });
    res.send(tasks);
  } catch (e) {
    next(e);
  }
});

tasksRouter.put('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    const id = req.params.id;

    let _id: Types.ObjectId;
    try {
      _id = new Types.ObjectId(req.user?._id);
    } catch {
      return res.status(404).send({ error: 'Wrong ObjectId!' });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send({ error: 'Task not found!' });
    }

    if (!task.user.equals(_id)) {
      return res.status(403).send({ error: 'You cannot change this task' });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    const updatedTask = await task.save();
    res.send(updatedTask);
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(422).send(e);
    }
    next(e);
  }
});

tasksRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    const taskId = req.params.id;

    let _id: Types.ObjectId;
    try {
      _id = new Types.ObjectId(req.user?._id);
    } catch {
      return res.status(404).send({ error: 'Wrong ObjectId!' });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({ error: 'Task not found!' });
    }

    if (!task.user.equals(_id)) {
      return res.status(403).send({ error: 'You cannot delete this task' });
    }

    await Task.deleteOne({ _id: taskId });
    return res.status(200).send({ message: `Task delete id = ${taskId}` });
  } catch (e) {
    next(e);
  }
});

export default tasksRouter;
