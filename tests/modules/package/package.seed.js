import { createPackage } from '../../../src/modules/package/package.services';

export const packages = [
  {
    document: null,
    input: {
      name: 'winter1',
      period: 1,
      price: 100,
    },
  },
  {
    document: null,
    input: {
      name: 'winter2',
      period: 2,
      price: 200,
    },
  },
  {
    document: null,
    input: {
      name: 'winter3',
      period: 3,
      price: 300,
    },
  },
  {
    document: null,
    input: {
      name: 'winter4',
      period: 4,
      price: 400,
    },
  },
  {
    document: null,
    input: {
      name: 'winter5',
      period: 5,
      price: 500,
    },
  },
];

export const seedPackages = async () => {
  await Promise.all(
    packages.map(async _package => {
      const document = await createPackage({ ..._package.input });
      _package.document = document;
    })
  );
};
