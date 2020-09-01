import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { getDangerousPostureTypeById } from '../dangerous-posture-type/dangerous-posture-type.services';
import { DangerousPosture } from './dangerous-posture.model.js';
import {
  validateDangerousPostureRequired,
  validateName,
  validateNameExists,
} from './dangerous-posture.validators';

export const getDangerousPostureById = async (_id, projection) =>
  getDocumentById('DangerousPosture', _id, projection);

export const getDangerousPostures = async (query, initialFind) =>
  mongooseQuery('DangerousPosture', query, initialFind);

export const createDangerousPosture = async data => {
  const { dangerousPostureTypeId, description, title } = data;
  await validateName(title);
  await validateNameExists(title);

  const dangerousPosture = new DangerousPosture({
    dangerousPostureType: dangerousPostureTypeId,
    description,
    title,
  });
  const createdDangerousPosture = await dangerousPosture.save();
  return createdDangerousPosture;
};

export const updateDangerousPosture = async (dangerousPosture, data) => {
  const { dangerousPostureTypeId, description, title } = data;

  if (!isNil(title) && dangerousPosture.title !== title) {
    await validateNameExists(title);
    await validateName(title);
    dangerousPosture.title = title;
  }
  console.log(456);

  if (!isNil(description)) {
    dangerousPosture.description = description;
  }
  console.log(123);
  if (!isNil(dangerousPostureTypeId)) {
    await validateDangerousPostureRequired(dangerousPostureTypeId);
    dangerousPosture.dangerousPostureType = dangerousPostureTypeId;
  }
  console.log(789);

  const updatedDangerousPosture = await dangerousPosture.save();
  return updatedDangerousPosture;
};

export const deleteDangerousPosture = async dangerousPosture => {
  const deletedDangerousPosture = await dangerousPosture.remove();
  return deletedDangerousPosture;
};
