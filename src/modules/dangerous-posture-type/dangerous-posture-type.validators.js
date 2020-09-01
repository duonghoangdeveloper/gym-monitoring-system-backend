import { throwError } from '../../common/services';
import { DangerousPostureType } from './dangerous-posture-type.model';

export const validateName = async name => {
  if (name.length < 2) {
    throwError('Name length must be 2 at minimum', 422);
  }
  if (name.length > 300) {
    throwError('Name length must be 300 at maximum', 422);
  }
};

export const validateNameExists = async name => {
  const nameExists = await DangerousPostureType.exists({ name });
  if (nameExists) {
    throwError('Name already exists', 409);
  }
};
