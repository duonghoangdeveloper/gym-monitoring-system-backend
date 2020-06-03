/* eslint-disable sort-keys-fix/sort-keys-fix */
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const connectOptions = {
  user: process.env.MONGODB_USERNAME,
  pass: process.env.MONGODB_PASSWORD,

  // Fix all deprecation warnings
  // https://mongoosejs.com/docs/deprecations.html
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,

  bufferCommands: false, // Not play with buffer because they are too heavy
  autoIndex: process.env.NODE_ENV === 'dev', // Not auto create index each time mongoose start up in test/prod => not impact performance
};

export const configDatabase = app => {
  try {
    mongoose.connect(process.env.MONGODB_URL, connectOptions);
  } catch (e) {
    mongoose.createConnection(process.env.MONGODB_URL, connectOptions);
  }

  mongoose.connection
    .once('open', () => {
      app.emit('ready');
      console.log('MongoDB is running 🍀');
    })
    .on('error', console.error.bind(console, 'Connection error:'));
};
