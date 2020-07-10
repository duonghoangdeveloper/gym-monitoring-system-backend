import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { Package } from './package.model';
import {
  validateName,
  validatePeriod,
  validatePrice,
} from './package.validators';

export const getPackageById = async (_id, projection) =>
  getDocumentById('Package', _id, projection);

export const getPackages = async (query, initialFind) =>
  mongooseQuery('Package', query, initialFind);

export const createPackage = async data => {
  const { name, period, price } = data;
  console.log(price);
  await validateName(name);
  await validatePrice(price);
  await validatePeriod(period);

  const _package = new Package({ name, period, price });
  const createdPackage = await _package.save();
  return createdPackage;
};

export const updatePackage = async (_package, data) => {
  const { name, period, price } = data;

  if (!isNil(name)) {
    await validateName(name);
    _package.name = name;
  }
  if (!isNil(price)) {
    await validatePrice(price);
    _package.price = price;
  }
  if (!isNil(period)) {
    await validatePeriod(period);
    _package.period = period;
  }

  const updatedPackage = await _package.save();
  return updatedPackage;
};

export const deletePackage = async _package => {
  const deletedPackage = await _package.remove();
  return deletedPackage;
};
