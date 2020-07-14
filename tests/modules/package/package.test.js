import 'cross-fetch/polyfill';

import { gql } from 'apollo-boost';

import { seedDatabase } from '../../common/seed-database';
import {
  connectDatabase,
  disconnectDatabase,
  getClient,
  isPartial,
} from '../../common/services';
import { users } from './package.seed';

beforeAll(connectDatabase);
beforeEach(seedDatabase);
afterAll(disconnectDatabase);

test('Should create new package', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter3',
    period: 3,
    price: 300,
  };

  const response = await client.mutate({
    mutation: gql`
      mutation($data: CreatePackageInput!) {
        createPackage(data: $data) {
          _id
          name
          period
          price
          createAt
          updateAt
        }
      }
    `,
    variables: {
      data,
    },
  });

  expect(
    isPartial({ ...data, password: undefined }, response?.data?.createUser)
  ).toBe(true);
});

test('Should not create new package without token', async () => {
  const client = getClient();

  const data = {
    name: 'winter3',
    period: 3,
    price: 300,
  };

  const response = await client.mutate({
    mutation: gql`
      mutation($data: CreatePackageInput!) {
        createPackage(data: $data) {
          _id
          name
          period
          price
          createAt
          updateAt
        }
      }
    `,
    variables: {
      data,
    },
  });

  expect(response).rejects.toThrow();
});
