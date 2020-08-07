import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { PaymentPlan } from './payment-plan.model';
import {
  validateName,
  validateNameExists,
  validatePeriod,
  validatePrice,
} from './payment-plan.validators';

export const getPaymentPlanById = async (_id, projection) =>
  getDocumentById('PaymentPlan', _id, projection);

export const getPaymentPlans = async (query, initialFind) =>
  mongooseQuery('PaymentPlan', query, initialFind);

export const createPaymentPlan = async data => {
  const { name, period, price } = data;

  await validateName(name);
  await validateNameExists(name);
  await validatePrice(price);
  await validatePeriod(period);

  const paymentPlan = new PaymentPlan({ name, period, price });
  const createdPaymentPlan = await paymentPlan.save();
  return createdPaymentPlan;
};

export const updatePaymentPlan = async (paymentPlan, data) => {
  const { name, period, price } = data;

  if (!isNil(name) && paymentPlan.name !== name) {
    await validateNameExists(name);
    await validateName(name);
    paymentPlan.name = name;
  }
  if (!isNil(price)) {
    await validatePrice(price);
    paymentPlan.price = price;
  }
  if (!isNil(period)) {
    await validatePeriod(period);
    paymentPlan.period = period;
  }

  const updatedPaymentPlan = await paymentPlan.save();
  return updatedPaymentPlan;
};

export const deletePaymentPlan = async paymentPlan => {
  const deletedPaymentPlan = await paymentPlan.remove();
  return deletedPaymentPlan;
};
