import validator from 'validator';

import { throwError } from '../../common/services';

export const validateName = name => {
  if (name.length < 6) {
    throwError('Name length must be 6 at minimum', 422);
  }
  if (name.length > 30) {
    throwError('Name length must be 30 at maximum', 422);
  }
};

export const validatePrice = price => {
  if (!(typeof price === 'number')) {
    throwError('Price must be number', 422);
  }
};

export const validatePeriod = period => {
  if (!(typeof period === 'number')) {
    throwError('Period must be number', 422);
  }
};
