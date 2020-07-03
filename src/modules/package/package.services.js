import { getDocumentById, mongooseQuery } from '../../common/services';
import { Package } from './package.model';
import {
  validateName,
  validatePeriod,
  validatePrice,
} from './package.validators';

export const getPackageById = async (_id, projection) =>
  getDocumentById('Package', _id, projection);

export const createPackage = async data => {
  const { name, period, price } = data;

  validateName(name);
  validatePrice(price);
  validatePeriod(period);

  const _package = new Package({ name, period, price });
  const createdPackage = await _package.save();
  return createdPackage;
};

export const getPackages = async (query, initialQuery) =>
  mongooseQuery('Package', query, initialQuery);

export const updatePackage = async (p, data) => {
  const { name, period, price } = data;

  if (name) {
    validateName(name);
  }
  if (price) {
    validatePrice(price);
  }
  if (period) {
    validatePeriod(period);
  }

  const updatedPackage = await p.save();
  return updatedPackage;
};

export const deletePackage = async p => {
  const deletedPackage = await p.remove();
  return deletedPackage;
};
