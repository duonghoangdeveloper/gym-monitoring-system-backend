import { throwError } from '../../common/services';
import { Camera } from './camera.model';

export const validateMacAddress = async macAddress => {
  if (
    macAddress &&
    !/^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/.test(macAddress)
  ) {
    throwError('MAC address is invalid', 422);
  }
};

export const validateMacAddressExists = async macAddress => {
  const macAddressExists = await Camera.exists({ macAddress });
  if (macAddress && macAddressExists) {
    throwError('MacAddress already exists', 409);
  }
};

export const validateName = async name => {
  if (name) {
    if (name.length < 3) {
      throwError('Name length must be 3 at minimum', 422);
    }
    if (name.length > 60) {
      throwError('Name length must be 60 at maximum', 422);
    }
  }
};
