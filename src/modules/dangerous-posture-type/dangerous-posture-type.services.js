import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { DangerousPostureType } from './dangerous-posture-type.model';
import {
  validateName,
  validateNameExists,
} from './dangerous-posture-type.validators';

export const getDangerousPostureTypeById = async (_id, projection) =>
  getDocumentById('DangerousPostureType', _id, projection);

export const getDangerousPostureTypes = async (query, initialFind) =>
  mongooseQuery('DangerousPostureType', query, initialFind);

export const createDangerousPostureType = async data => {
  const { description, title } = data;

  await validateName(title);
  await validateNameExists(title);

  const dangerousPostureType = new DangerousPostureType({
    description,
    title,
  });
  const createdDangerousPostureType = await dangerousPostureType.save();
  return createdDangerousPostureType;
};

export const updateDangerousPostureType = async (
  dangerousPostureType,
  data
) => {
  const { description, title } = data;

  if (!isNil(title) && dangerousPostureType.title !== title) {
    await validateNameExists(title);
    await validateName(title);
    dangerousPostureType.title = title;
  }

  if (!isNil(description)) {
    dangerousPostureType.description = description;
  }

  const updatedDangerousPostureType = await dangerousPostureType.save();
  return updatedDangerousPostureType;
};

export const deleteDangerousPostureType = async dangerousPostureType => {
  const deletedDangerousPostureType = await dangerousPostureType.remove();
  return deletedDangerousPostureType;
};
