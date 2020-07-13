import 'cross-fetch/polyfill';

import { gql } from 'apollo-boost';

import { seedDatabase } from '../../common/seed-database';
import {
  connectDatabase,
  disconnectDatabase,
  getClient,
  isPartial,
} from '../../common/services';
import { users } from './user.seed';

beforeAll(connectDatabase);
afterAll(disconnectDatabase);

beforeEach(seedDatabase);

test('Should create new user', async () => {
  const client = getClient(users[0].token);

  const data = {
    displayName: 'Hoang Dai Duong',
    email: 'duonghoangdeveloper2@gmail.com',
    gender: 'MALE',
    password: '123456',
    phone: '0342773627',
    username: 'duonghoangdeveloper2',
  };

  const response = await client.mutate({
    mutation: gql`
      mutation($data: CreateUserInput!) {
        createUser(data: $data) {
          _id
          displayName
          email
          gender
          phone
          username
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

test('Should not create new user without token', async () => {
  const client = getClient();

  const data = {
    displayName: 'Hoang Dai Duong',
    email: 'duonghoangdeveloper@gmail.com',
    gender: 'MALE',
    password: '123456',
    phone: '0342773627',
    username: 'duonghoangdeveloper',
  };

  expect(
    client.mutate({
      mutation: gql`
        mutation($data: CreateUserInput!) {
          createUser(data: $data) {
            _id
            displayName
            email
            gender
            phone
            username
          }
        }
      `,
      variables: {
        data,
      },
    })
  ).rejects.toEqual({
    error: 'Unauthorized',
  });
});
