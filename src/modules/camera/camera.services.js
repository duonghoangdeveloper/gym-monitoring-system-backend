import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { Camera } from './camera.model';
import {
  validateMacAddress,
  validateMacAddressExists,
  validateName,
} from './camera.validators';

export const getCameraById = async (_id, projection) =>
  getDocumentById('Camera', _id, projection);

export const getCameras = async (query, initialFind) =>
  mongooseQuery('Camera', query, initialFind);

export const createCamera = async data => {
  const { macAddress, name, password, username } = data;

  await validateMacAddress(macAddress);
  await validateMacAddressExists(macAddress);
  await validateName(name);

  const camera = new Camera({
    macAddress,
    name,
    password,
    username,
  });
  const createdCamera = await camera.save();
  return createdCamera;
};

export const updateCamera = async (camera, data) => {
  const { name } = data;

  await validateName(name);

  camera.name = name;

  const updatedCamera = await camera.save();
  return updatedCamera;
};

export const deleteCamera = async camera => {
  const deletedCamera = await camera.remove();
  return deletedCamera;
};
