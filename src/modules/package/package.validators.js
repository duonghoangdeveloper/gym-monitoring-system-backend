import { throwError } from '../../common/services';
import { Package } from './package.model';

export const validateName = async name => {
  if (name.length < 6) {
    throwError('Name length must be 6 at minimum', 422);
  }
  if (name.length > 30) {
    throwError('Name length must be 30 at maximum', 422);
  }
};

export const validateNameExists = async name => {
  const nameExists = await Package.exists({ name });
  if (nameExists) {
    throwError('Name already exists', 409);
  }
};

export const validatePrice = async price => {
  if (!(typeof price === 'number')) {
    throwError('Price must be number', 422);
  }
};

export const validatePeriod = async period => {
  if (!(typeof period === 'number')) {
    throwError('Period must be number', 422);
  }
};
