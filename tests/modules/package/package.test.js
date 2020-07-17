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

  expect(isPartial(data, (await response)?.data?.createPackage)).toBe(true);
});

test('Should create new package by owner', async () => {
  const client = getClient(users[1].token);

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

  expect(isPartial(data, (await response)?.data?.createPackage)).toBe(true);
});

test('Should create new package by manager', async () => {
  const client = getClient(users[2].token);

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

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not create new package by trainer', async () => {
  const client = getClient(users[3].token);

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

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not create new package by customer', async () => {
  const client = getClient(users[4].token);

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

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not create new package with exist name', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter1',
    period: 1,
    price: 100,
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

  await (await expect(response)).rejects.toThrow('Name already exists');
});

test('Should not create new package with name.lenght <6', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'win6',
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

  await (await expect(response)).rejects.toThrow(
    'Name length must be 6 at minimum'
  );
});

test('Should not create new package with name.lenght >300', async () => {
  const client = getClient(users[0].token);

  const data = {
    name: 'winter6winter6winter6winter6winter6winter6',
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

  await (await expect(response)).rejects.toThrow(
    'Name length must be 30 at maximum'
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

  await (await expect(response)).rejects.toThrow('Unauthorized');
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

  expect(isPartial(data, (await response)?.data?.updatePackage)).toBe(true);
});

test('Should update package by onwer', async () => {
  const client = getClient(users[1].token);
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

  expect(isPartial(data, (await response)?.data?.updatePackage)).toBe(true);
});

test('Should not update package by manager', async () => {
  const client = getClient(users[2].token);
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

test('Should not update package by trainer', async () => {
  const client = getClient(users[3].token);
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

test('Should not update package by customer', async () => {
  const client = getClient(users[4].token);
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

test('Should not update package with name.lenght <6', async () => {
  const client = getClient(users[0].token);
  const packageRoot = packages[0];

  const data = {
    name: 'win1',
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

  await (await expect(response)).rejects.toThrow(
    'Name length must be 6 at minimum'
  );
});

test('Should not update package with name.lenght >30', async () => {
  const client = getClient(users[0].token);
  const packageRoot = packages[0];

  const data = {
    name: 'winter1winter1winter1winter1winter1',
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

  await (await expect(response)).rejects.toThrow(
    'Name length must be 30 at maximum'
  );
});

test('Should update package with same name', async () => {
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

  expect(isPartial(data, (await response)?.data?.updatePackage)).toBe(true);
});

test('Should not update package with exist name', async () => {
  const client = getClient(users[0].token);
  const packageRoot = packages[0];

  const data = {
    name: 'winter2',
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

  await (await expect(response)).rejects.toThrow('Name already exists');
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

  await (await expect(response)).rejects.toThrow('Unauthorized');
});

test('Should delete package', async () => {
  const client = getClient(users[0].token);
  const packageRoot = packages[4];

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
      _id: packageRoot.document._id,
    },
  });

  expect(
    isPartial(
      packageRoot.document._id.toString(),
      (await response)?.data?.deletePackage._id.toString()
    )
  ).toBe(true);
});

test('Should delete package by onwer', async () => {
  const client = getClient(users[1].token);
  const packageRoot = packages[3];

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
      _id: packageRoot.document._id,
    },
  });

  expect(
    isPartial(
      packageRoot.document._id.toString(),
      (await response)?.data?.deletePackage._id.toString()
    )
  ).toBe(true);
});

test('Should not delete package by manager', async () => {
  const client = getClient(users[2].token);
  const packageRoot = packages[2];

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
      _id: packageRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not delete package by trainer', async () => {
  const client = getClient(users[3].token);
  const packageRoot = packages[1];

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
      _id: packageRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not delete package by customer', async () => {
  const client = getClient(users[4].token);
  const packageRoot = packages[0];

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
      _id: packageRoot.document._id,
    },
  });

  await expect(response).rejects.toThrow('Unauthorized');
});

test('Should not delete package without token', async () => {
  const client = getClient();
  const packageRoot = packages[4];

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
      _id: packageRoot.document._id,
    },
  });

  await (await expect(response)).rejects.toThrow('Unauthorized');
});
