import ApolloBoost from 'apollo-boost';
import _ from 'lodash';
import mongoose from 'mongoose';

import { connectOptions } from '../../src/configs/config-database';

mongoose.Promise = global.Promise;

export const connectDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_URL, connectOptions);
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

export const getClient = token =>
  new ApolloBoost({
    request(operation) {
      if (token) {
        operation.setContext({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    },
    uri: `http://localhost:${process.env.PORT}/graphql`,
  });

export const isPartial = (object, biggerObject) =>
  Object.keys(object).every(key => _.isEqual(object[key], biggerObject[key]));
