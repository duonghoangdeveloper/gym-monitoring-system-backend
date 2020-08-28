import { throwError } from '../../common/services';
import { DangerousPosture } from './dangerous-posture.model.js';

export const validateName = async name => {
  if (name.length < 2) {
    throwError('Name length must be 2 at minimum', 422);
  }
  if (name.length > 300) {
    throwError('Name length must be 300 at maximum', 422);
  }
};

export const validateNameExists = async name => {
  const nameExists = await DangerousPosture.exists({ name });
  if (nameExists) {
    throwError('Name already exists', 409);
  }
};
export const validateDangerousPostureRequired = async dangerousPostureId => {
  const dangerousPostureExists = await DangerousPosture.exists({
    _id: dangerousPostureId,
  });
  if (!dangerousPostureExists) {
    throwError('dangerousPosture not found', 404);
  }
};
