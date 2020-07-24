import 'cross-fetch/polyfill';

import { gql } from 'apollo-boost';

import { seedDatabase } from '../../common/seed-database';
import {
  connectDatabase,
  disconnectDatabase,
  getClient,
  isPartial,
} from '../../common/services';
import { users } from '../user/user.seed';

beforeAll(connectDatabase);
afterAll(disconnectDatabase);

beforeEach(seedDatabase);

test('Should create feedback', async () => {
  const client = getClient(users[4].token);

  const data = {
    content: 'Content of new feedback',
    title: 'New feedback',
  };

  const response = await client.mutate({
    mutation: gql`
      mutation CreateFeedback($data: CreateFeedbackInput!) {
        createFeedback(data: $data) {
          _id
          content
          title
        }
      }
    `,
    variables: {
      data,
    },
  });

  expect(isPartial(data, response?.data?.createFeedback)).toBe(true);
});

test('Should not create feedback without role customer', async () => {
  const client = getClient(users[1].token);

  const data = {
    content: 'Content of new feedback',
    title: 'New feedback',
  };

  await expect(
    client.mutate({
      mutation: gql`
        mutation CreateFeedback($data: CreateFeedbackInput!) {
          createFeedback(data: $data) {
            _id
            content
            title
          }
        }
      `,
      variables: {
        data,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
