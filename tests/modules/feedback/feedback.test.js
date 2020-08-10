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
import { feedbacks } from './feedback.seed';

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
test('Should not create feedback with role Trainer', async () => {
  const client = getClient(users[3].token);

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
test('Should not create feedback with role Gym_owner', async () => {
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
test('Should not create feedback with role Manager', async () => {
  const client = getClient(users[2].token);

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
test('Should not create feedback with role System_Admin', async () => {
  const client = getClient(users[0].token);

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
test('Should not delete feedback with role customer', async () => {
  const client = getClient(users[4].token);
  const feedbackRoot = feedbacks[0].document._id;

  await expect(
    client.mutate({
      mutation: gql`
        mutation DeleteFeedbackByAdmin($_id: ID!) {
          deleteFeedbackByAdmin(_id: $_id) {
            _id
          }
        }
      `,
      variables: {
        _id: feedbackRoot,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
test('Should not delete feedback with role Trainer', async () => {
  const client = getClient(users[3].token);
  const feedbackRoot = feedbacks[0].document._id;

  await expect(
    client.mutate({
      mutation: gql`
        mutation DeleteFeedbackByAdmin($_id: ID!) {
          deleteFeedbackByAdmin(_id: $_id) {
            _id
          }
        }
      `,
      variables: {
        _id: feedbackRoot,
      },
    })
  ).rejects.toThrow('Unauthorized');
});

test('Should update feedback', async () => {
  const client = getClient(users[4].token);
  const feedbackRoot = feedbacks[1];

  const data = {
    content: 'Content of new feedbacks',
    title: 'New feedback',
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdateFeedbackByCustomer($_id: ID!, $data: UpdateFeedbackInput) {
        updateFeedbackByCustomer(_id: $_id, data: $data) {
          content
          title
        }
      }
    `,
    variables: {
      _id: feedbackRoot.document._id.toString(),
      data,
    },
  });

  expect(
    isPartial(data, (await response)?.data?.updateFeedbackByCustomer)
  ).toBe(true);
});

test('Should not update feedback without role customer', async () => {
  const client = getClient(users[3].token);
  const feedbackRoot = feedbacks[0];

  const data = {
    content: 'Content of new feedbacks',
    title: 'New feedback',
  };

  await expect(
    client.mutate({
      mutation: gql`
        mutation UpdateFeedbackByCustomer(
          $_id: ID!
          $data: UpdateFeedbackInput
        ) {
          updateFeedbackByCustomer(_id: $_id, data: $data) {
            content
            title
          }
        }
      `,
      variables: {
        _id: feedbackRoot.document._id,
        data,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
test('Should not update feedback with role System_Admin', async () => {
  const client = getClient(users[0].token);
  const feedbackRoot = feedbacks[0];

  const data = {
    content: 'Content of new feedbacks',
    title: 'New feedback',
  };

  await expect(
    client.mutate({
      mutation: gql`
        mutation UpdateFeedbackByCustomer(
          $_id: ID!
          $data: UpdateFeedbackInput
        ) {
          updateFeedbackByCustomer(_id: $_id, data: $data) {
            content
            title
          }
        }
      `,
      variables: {
        _id: feedbackRoot.document._id,
        data,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
test('Should not update feedback with role Gym_owner', async () => {
  const client = getClient(users[1].token);
  const feedbackRoot = feedbacks[0];

  const data = {
    content: 'Content of new feedbacks',
    title: 'New feedback',
  };

  await expect(
    client.mutate({
      mutation: gql`
        mutation UpdateFeedbackByCustomer(
          $_id: ID!
          $data: UpdateFeedbackInput
        ) {
          updateFeedbackByCustomer(_id: $_id, data: $data) {
            content
            title
          }
        }
      `,
      variables: {
        _id: feedbackRoot.document._id,
        data,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
test('Should not update feedback with role Manager', async () => {
  const client = getClient(users[2].token);
  const feedbackRoot = feedbacks[0];

  const data = {
    content: 'Content of new feedbacks',
    title: 'New feedback',
  };

  await expect(
    client.mutate({
      mutation: gql`
        mutation UpdateFeedbackByCustomer(
          $_id: ID!
          $data: UpdateFeedbackInput
        ) {
          updateFeedbackByCustomer(_id: $_id, data: $data) {
            content
            title
          }
        }
      `,
      variables: {
        _id: feedbackRoot.document._id,
        data,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
test('Should not update feedback with role Trainer', async () => {
  const client = getClient(users[3].token);
  const feedbackRoot = feedbacks[0];

  const data = {
    content: 'Content of new feedbacks',
    title: 'New feedback',
  };

  await expect(
    client.mutate({
      mutation: gql`
        mutation UpdateFeedbackByCustomer(
          $_id: ID!
          $data: UpdateFeedbackInput
        ) {
          updateFeedbackByCustomer(_id: $_id, data: $data) {
            content
            title
          }
        }
      `,
      variables: {
        _id: feedbackRoot.document._id,
        data,
      },
    })
  ).rejects.toThrow('Unauthorized');
});
