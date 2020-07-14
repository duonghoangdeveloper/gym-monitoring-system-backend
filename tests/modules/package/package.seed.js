import { createPackage } from '../../../src/modules/package/package.services';
import { signIn } from '../../../src/modules/user/user.services';

export const users = [
  {
    document: null,
    input: {
      name: 'winter1',
      period: 1,
      price: 100,
    },
    token: null,
  },
  {
    document: null,
    input: {
      name: 'winter2',
      period: 2,
      price: 200,
    },
    token: null,
  },
  {
    document: null,
    input: {
      name: 'winter3',
      period: 3,
      price: 300,
    },
    token: null,
  },
  {
    document: null,
    input: {
      name: 'winter4',
      period: 4,
      price: 400,
    },
    token: null,
  },
  {
    document: null,
    input: {
      name: 'winter5',
      period: 5,
      price: 500,
    },
    token: null,
  },
];

export const seedPackages = async () => {
  await Promise.all(
    users.map(async user => {
      const document = await createPackage({ ...user.input });
      const { token } = await signIn({
        password: user.input.password,
        username: user.input.username,
      });

      user.document = document;
      user.token = token;
    })
  );
};
