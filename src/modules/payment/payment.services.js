import isNil from 'lodash.isnil';
import moment from 'moment';

import {
  getDocumentById,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { getPackageById } from '../package/package.services';
import { Payment } from './payment.model';
import {
  validateCreatorRequired,
  validateCustomerRequired,
  validatePackageRequired,
} from './payment.validators';

export const getPaymentById = async (_id, projection) =>
  getDocumentById('Payment', _id, projection);

export const getPayments = async (query, initialFind) =>
  mongooseQuery('Payment', query, initialFind);

export const createPayment = async data => {
  const { creatorId, customerId, packageId } = data;

  validateCreatorRequired(creatorId);
  validateCustomerRequired(customerId);

  const payment = new Payment({
    creator: creatorId,
    customer: customerId,
    package: await getPackageById(packageId),
  });

  const createdPayment = await payment.save();
  return createdPayment;
};

export const updatePayment = async (payment, data) => {
  const { creatorId, customerId, packageId } = data;

  const createdMoment = moment(payment.createdAt);
  const nowMoment = moment();

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

  if (!isNil(packageId)) {
    await validatePackageRequired(packageId);
    payment.package = await getPackageById(packageId);
  }

  const updatedPayment = await payment.save();
  return updatedPayment;
};

export const deletePayment = async payment => {
  const deletedPayment = await payment.remove();
  return deletedPayment;
};
