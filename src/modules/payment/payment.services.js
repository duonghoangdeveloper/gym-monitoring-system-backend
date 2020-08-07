import isNil from 'lodash.isnil';
import moment from 'moment';

import {
  getDocumentById,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { getPaymentPlanById } from '../payment-plan/payment-plan.services';
import { getUserById } from '../user/user.services';
import { Payment } from './payment.model';
import {
  validateCreatorRequired,
  validateCustomerRequired,
  validatePaymentPlanRequired,
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

  const createdMoment = moment(payment.createdAt);
  const nowMoment = moment();

  // const diffDays = nowMoment.diff(createdMoment, 'days');
  // if (diffDays > 1) {
  //   throwError('Out of date to update', 404);
  // }

  const diff = nowMoment.diff(createdMoment);
  const diffDuration = moment.duration(diff);
  if (diffDuration.days() > 1) {
    throwError('Out of date to update', 409);
  }

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
