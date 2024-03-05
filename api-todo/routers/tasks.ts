import express from 'express';
import mongoose from 'mongoose';
import auth, { RequestWithUser } from '../middleware/auth';
import Task from '../models/Task';

const tasksRouter = express.Router();

tasksRouter.post('/', auth, async (req: RequestWithUser, res, next) => {
  try {
    const task = new Task({
      user: req.user?._id,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
    });
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
    const tasks = await Task.find({ user: req.user?._id }).populate('user', [
      'token',
      'username',
    ]);
    res.send(tasks);
  } catch (e) {
    next(e);
  }
});

tasksRouter.put('/:id', auth, async (req: RequestWithUser, res, next) => {
  try {
    const id = req.params.id;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send({ error: 'Task not found!' });
    }

    const newTask = await Task.updateOne(
      {
        _id: id,
        user: req.user?._id,
      },
      {
        title: req.body.title,
        description: req.body.description ?? null,
        status: req.body.status,
      },
      {
        runValidators: true,
      },
    );

    if (newTask.modifiedCount === 0) {
      res.status(403).send({ message: 'Some error in update task!' });
    }

    res.send(newTask);

    /*if (!task.user.equals(req.user?._id)) {
      return res.status(403).send({ error: 'You cannot change this task' });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    const updatedTask = await task.save();
    res.send(updatedTask);*/
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

    /* const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({ error: 'Task not found!' });
    }

    if (!task.user.equals(req.user?._id)) {
      return res.status(403).send({ error: 'You cannot delete this task' });
    }

    await Task.deleteOne({ _id: taskId });*/

    const result = await Task.findOneAndDelete({
      _id: taskId,
      user: req.user?._id,
    });

    if (!result) {
      return res.status(403).send({ message: 'Some error in delete' });
    }

    return res.send({ message: `Task delete id = ${taskId}` });
  } catch (e) {
    next(e);
  }
});

export default tasksRouter;
