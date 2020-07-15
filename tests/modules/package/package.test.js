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
import { packages } from './package.seed';

beforeAll(connectDatabase);
beforeEach(seedDatabase);
afterAll(disconnectDatabase);

test('Should create new package', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePackage($data: CreatePackageInput!) {
        createPackage(data: $data) {
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

  expect(isPartial({ ...data }, (await response)?.data?.createPackage)).toBe(
    true
  );
});

test('Should not create new package without token', async () => {
  const client = getClient();

  const data = {
    name: 'winter6',
    period: 6,
    price: 600,
  };

  const response = client.mutate({
    mutation: gql`
      mutation CreatePackage($data: CreatePackageInput!) {
        createPackage(data: $data) {
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

  (await expect(response)).rejects.toThrow('Unauthorized');
});

test('Should update package', async () => {
  const client = getClient(users[0].token);
  const packageRoot = packages[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePackage($_id: ID!, $data: UpdatePackageInput) {
        updatePackage(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: packageRoot.document._id,
      data,
    },
  });

  expect(isPartial({ ...data }, (await response)?.data?.updatePackage)).toBe(
    true
  );
});

test('Should not update package without token', async () => {
  const client = getClient();
  const packageRoot = packages[0];

  const data = {
    name: 'winter1',
    period: 11,
    price: 1100,
  };

  const response = client.mutate({
    mutation: gql`
      mutation UpdatePackage($_id: ID!, $data: UpdatePackageInput) {
        updatePackage(_id: $_id, data: $data) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: packageRoot.document._id,
      data,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should delete package', async () => {
  const client = getClient(users[0].token);
  const packageRoot = packages[4].document._id;

  const response = client.mutate({
    mutation: gql`
      mutation DeletePackage($_id: ID!) {
        deletePackage(_id: $_id) {
          _id
          name
          price
          period
        }
      }
    `,
    variables: {
      _id: packageRoot,
    },
  });
  expect(
    isPartial(
      packageRoot.toString(),
      (await response)?.data?.deletePackage._id.toString()
    )
  ).toBe(true);
});

test('Should not delete package without token', async () => {
  const client = getClient();
  const packageRoot = packages[4];

  const response = client.mutate({
    mutation: gql`
      mutation DeletePackage($_id: ID!) {
        deletePackage(_id: $_id) {
          _id
        }
      }
    `,
    variables: {
      _id: packageRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});
