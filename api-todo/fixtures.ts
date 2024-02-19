import mongoose from 'mongoose';
import config from './config';
import User from './models/User';
import Task from './models/Task';

const dropCollection = async (
  db: mongoose.Connection,
  collectionName: string,
) => {
  try {
    await db.dropCollection(collectionName);
  } catch (e) {
    console.log(`Collection ${collectionName} was missing, skipping drop....`);
  }
};

const run = async () => {
  await mongoose.connect(config.mongoose.db);
  const db = mongoose.connection;

  const collections = ['tasks', 'users'];

  for (const collectionName of collections) {
    await dropCollection(db, collectionName);
  }

  const [user1, user2] = await User.create(
    {
      username: 'user1',
      password: 'qwert1',
      token: crypto.randomUUID(),
    },
    {
      username: 'user2',
      password: 'qwert2',
      token: crypto.randomUUID(),
    },
  );

  await Task.create({
    user: user1._id,
    title: 'Laba 1',
    description: 'Do laba',
    status: 'new',
  });

  await Task.create({
    user: user2._id,
    title: 'HW-1',
    description: 'Do homework',
    status: 'new',
  });

  await db.close();
};

void run();
