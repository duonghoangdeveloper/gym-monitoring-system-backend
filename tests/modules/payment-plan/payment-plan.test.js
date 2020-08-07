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
import { paymentPlans } from './payment-plan.seed';

beforeAll(connectDatabase);
beforeEach(seedDatabase);
afterAll(disconnectDatabase);

test('Should create new paymentPlan', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  expect(isPartial(data, (await response)?.data?.createPaymentPlan)).toBe(true);
});

test('Should create new paymentPlan by owner', async () => {
  const client = getClient(users[1].token);

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  expect(isPartial(data, (await response)?.data?.createPaymentPlan)).toBe(true);
});

test('Should create new paymentPlan by manager', async () => {
  const client = getClient(users[2].token);

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not create new paymentPlan by trainer', async () => {
  const client = getClient(users[3].token);

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not create new paymentPlan by customer', async () => {
  const client = getClient(users[4].token);

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not create new paymentPlan with exist name', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter1',
    period: 1,
    price: 100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await (await expect(response)).rejects.toThrow('Name already exists');
});

test('Should not create new paymentPlan with name.lenght <6', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'win6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await (await expect(response)).rejects.toThrow(
    'Name length must be 6 at minimum'
  );
});

test('Should not create new paymentPlan with name.lenght >300', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter6winter6winter6winter6winter6winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await (await expect(response)).rejects.toThrow(
    'Name length must be 30 at maximum'
  );
});

test('Should not create new paymentPlan without token', async () => {
  const client = getClient();

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePaymentPlan($data: CreatePaymentPlanInput!) {
        createPaymentPlan(data: $data) {
          name
          price
          period
        }
      }
    `,
    variables: {
      data,
    },
  });

  await (await expect(response)).rejects.toThrow('Unauthorized');
});

test('Should update paymentPlan', async () => {
  const client = getClient(users[0].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  expect(isPartial(data, (await response)?.data?.updatePaymentPlan)).toBe(true);
});

test('Should update paymentPlan by onwer', async () => {
  const client = getClient(users[1].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  expect(isPartial(data, (await response)?.data?.updatePaymentPlan)).toBe(true);
});

test('Should not update paymentPlan by manager', async () => {
  const client = getClient(users[2].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not update paymentPlan by trainer', async () => {
  const client = getClient(users[3].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not update paymentPlan by customer', async () => {
  const client = getClient(users[4].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not update paymentPlan with name.lenght <6', async () => {
  const client = getClient(users[0].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'win1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await (await expect(response)).rejects.toThrow(
    'Name length must be 6 at minimum'
  );
});

test('Should not update paymentPlan with name.lenght >30', async () => {
  const client = getClient(users[0].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1winter1winter1winter1winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await (await expect(response)).rejects.toThrow(
    'Name length must be 30 at maximum'
  );
});

test('Should update paymentPlan with same name', async () => {
  const client = getClient(users[0].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  expect(isPartial(data, (await response)?.data?.updatePaymentPlan)).toBe(true);
});

test('Should not update paymentPlan with exist name', async () => {
  const client = getClient(users[0].token);
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter2',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await (await expect(response)).rejects.toThrow('Name already exists');
});

test('Should not update paymentPlan without token', async () => {
  const client = getClient();
  const paymentPlanRoot = paymentPlans[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePaymentPlan($_id: ID!, $data: UpdatePaymentPlanInput) {
        updatePaymentPlan(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
      data,
    },
  });

  await (await expect(response)).rejects.toThrow('Unauthorized');
});

test('Should delete paymentPlan', async () => {
  const client = getClient(users[0].token);
  const paymentPlanRoot = paymentPlans[4];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePaymentPlan($_id: ID!) {
        deletePaymentPlan(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
    },
  });

  expect(
    isPartial(
      paymentPlanRoot.document._id.toString(),
      (await response)?.data?.deletePaymentPlan._id.toString()
    )
  ).toBe(true);
});

test('Should delete paymentPlan by onwer', async () => {
  const client = getClient(users[1].token);
  const paymentPlanRoot = paymentPlans[3];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePaymentPlan($_id: ID!) {
        deletePaymentPlan(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
    },
  });

  expect(
    isPartial(
      paymentPlanRoot.document._id.toString(),
      (await response)?.data?.deletePaymentPlan._id.toString()
    )
  ).toBe(true);
});

test('Should not delete paymentPlan by manager', async () => {
  const client = getClient(users[2].token);
  const paymentPlanRoot = paymentPlans[2];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePaymentPlan($_id: ID!) {
        deletePaymentPlan(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not delete paymentPlan by trainer', async () => {
  const client = getClient(users[3].token);
  const paymentPlanRoot = paymentPlans[1];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePaymentPlan($_id: ID!) {
        deletePaymentPlan(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not delete paymentPlan by customer', async () => {
  const client = getClient(users[4].token);
  const paymentPlanRoot = paymentPlans[0];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePaymentPlan($_id: ID!) {
        deletePaymentPlan(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not delete paymentPlan without token', async () => {
  const client = getClient();
  const paymentPlanRoot = paymentPlans[4];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePaymentPlan($_id: ID!) {
        deletePaymentPlan(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: paymentPlanRoot.document._id,
    },
  });

  await (await expect(response)).rejects.toThrow('Unauthorized');
});
