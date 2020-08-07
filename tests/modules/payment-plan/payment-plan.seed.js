import { createPaymentPlan } from '../../../src/modules/payment-plan/payment-plan.services';

export const paymentPlans = [
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

export const seedPaymentPlans = async () => {
  await Promise.all(
    paymentPlans.map(async paymentPlan => {
      const document = await createPaymentPlan({ ...paymentPlan.input });
      paymentPlan.document = document;
    })
  );
};
