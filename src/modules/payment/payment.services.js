import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { getPackageById } from '../package/package.services';
import { getUserById } from '../user/user.services';
import { Payment } from './payment.model';
import {
  validateCreatorExists,
  validateCustomerExists,
  validatePackageExists,
} from './payment.validators';

export const getPaymentById = async (_id, projection) =>
  getDocumentById('Payment', _id, projection);

export const getPayments = async (query, initialFind) =>
  mongooseQuery('Payment', query, initialFind);

export const createPayment = async data => {
  const { creatorId, customerId, packageId } = data;

  validateCustomerExists(customerId);
  validatePackageExists(packageId);

  const _package = await getPackageById(packageId);

  const payment = new Payment({
    creator: creatorId,
    customer: customerId,
    package: _package,
  });

  const createdPayment = await payment.save();
  return createdPayment;
};

export const updatePayment = async (payment, data) => {
  const { creatorId, customerId, packageId, updateAt } = data;

  // Calculate updateAt
  // console.log('updateAt: ', updateAt);
  // console.log('updateAt: ', updateAt);

  if (!isNil(creatorId)) {
    await validateCreatorExists(creatorId);
    payment.creator = await getUserById(creatorId);
  }
  if (!isNil(customerId)) {
    await validateCustomerExists(customerId);
    payment.customer = await getUserById(customerId);
  }
  if (!isNil(packageId)) {
    await validatePackageExists(packageId);
    payment.package = await getPackageById(packageId);
  }
  const updatedPayment = await payment.save();
  return updatedPayment;
};

export const deletePayment = async payment => {
  const deletedPayment = await payment.remove();
  return deletedPayment;
};
