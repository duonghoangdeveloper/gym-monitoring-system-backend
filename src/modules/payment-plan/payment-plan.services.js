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

  const _paymentPlan = new PaymentPlan({ name, period, price });
  const createdPaymentPlan = await _paymentPlan.save();
  return createdPaymentPlan;
};

export const updatePaymentPlan = async (_paymentPlan, data) => {
  const { name, period, price } = data;

  if (!isNil(name) && _paymentPlan.name !== name) {
    await validateNameExists(name);
    await validateName(name);
    _paymentPlan.name = name;
  }
  if (!isNil(price)) {
    await validatePrice(price);
    _paymentPlan.price = price;
  }
  if (!isNil(period)) {
    await validatePeriod(period);
    _paymentPlan.period = period;
  }

  const updatedPaymentPlan = await _paymentPlan.save();
  return updatedPaymentPlan;
};

export const deletePaymentPlan = async _paymentPlan => {
  const deletedPaymentPlan = await _paymentPlan.remove();
  return deletedPaymentPlan;
};
