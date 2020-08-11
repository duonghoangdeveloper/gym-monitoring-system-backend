import { createUser, signIn } from '../../../src/modules/user/user.services';

export const users = [
  {
    document: null,
    input: {
      password: '123456',
      role: 'SYSTEM_ADMIN',
      username: 'systemadmin',
    },
    token: null,
  },
  {
    document: null,
    input: {
      password: '123456',
      role: 'GYM_OWNER',
      username: 'gymowner',
    },
    token: null,
  },
  {
    document: null,
    input: {
      password: '123456',
      role: 'MANAGER',
      username: 'manager',
    },
    token: null,
  },
  {
    document: null,
    input: {
      password: '123456',
      role: 'TRAINER',
      username: 'trainer',
    },
    token: null,
  },
  {
    document: null,
    input: {
      password: '123456',
      role: 'CUSTOMER',
      username: 'customer',
    },
    token: null,
  },
  {
    document: null,
    input: {
      password: '123456',
      role: 'CUSTOMER',
      username: 'customer2',
    },
    token: null,
  },
];

export const seedUsers = async () => {
  await Promise.all(
    users.map(async user => {
      const document = await createUser({ ...user.input });
      const { token } = await signIn({
        password: user.input.password,
        username: user.input.username,
      });

      user.document = document;
      user.token = token;
    })
  );
};
