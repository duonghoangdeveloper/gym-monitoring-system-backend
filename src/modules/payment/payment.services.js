import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { getPaymentPlanById } from '../payment-plan/payment-plan.services';
import { Payment } from './payment.model';
import {
  validateCreatorRequired,
  validateCustomerRequired,
  validatePaymentPlanRequired,
  validateUpdatePermission,
} from './payment.validators';

export const getPaymentById = async (_id, projection) =>
  getDocumentById('Payment', _id, projection);

export const getPayments = async (query, initialFind) =>
  mongooseQuery('Payment', query, initialFind);

export const createPayment = async data => {
  const { creatorId, customerId, paymentPlanId } = data;

  validateCreatorRequired(creatorId);
  validateCustomerRequired(customerId);

  const payment = new Payment({
    creator: creatorId,
    customer: customerId,
    paymentPlan: await getPaymentPlanById(paymentPlanId),
  });

  const createdPayment = await payment.save();
  return createdPayment;
};

export const updatePayment = async (payment, data) => {
  const { creatorId, customerId, paymentPlanId } = data;

  await validateUpdatePermission(payment.createdAt);

  if (!isNil(creatorId)) {
    await validateCreatorRequired(creatorId);
    payment.creator = creatorId;
  }

  if (!isNil(customerId)) {
    await validateCustomerRequired(customerId);
    payment.customer = customerId;
  }

  if (!isNil(paymentPlanId)) {
    await validatePaymentPlanRequired(paymentPlanId);
    payment.paymentPlan = await getPaymentPlanById(paymentPlanId);
  }

  const updatedPayment = await payment.save();
  return updatedPayment;
};

export const deletePayment = async payment => {
  const deletedPayment = await payment.remove();
  return deletedPayment;
};
