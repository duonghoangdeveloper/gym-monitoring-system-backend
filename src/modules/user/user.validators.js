import validator from 'validator';

import { userGenders, userRoles } from '../../common/enums';
import { throwError } from '../../common/services';

export const validateUsername = username => {
  if (username.length < 6) {
    throwError('Username length must be 6 at minimum', 422);
  }
  if (username.length > 30) {
    throwError('Username length must be 30 at maximum', 422);
  }
};

export const validatePassword = password => {
  if (password.length < 6) {
    throwError('Password length must be 6 at minimum', 422);
  }
  if (password.length > 30) {
    throwError('Password length must be 30 at maximum', 422);
  }
};

export const validateGender = gender => {
  if (!userGenders.includes(gender)) {
    throwError('Gender is invalid', 401);
  }
};

export const validateRole = role => {
  if (!userRoles.includes(role)) {
    throwError('Role is invalid', 401);
  }
};

export const validateEmail = email => {
  if (!validator.isEmail(email)) {
    throwError('Email is invalid', 422);
  }
};

export const validatePhone = phone => {
  if (!validator.isMobilePhone(phone)) {
    throwError('Phone number is invalid', 422);
  }
};

export const validateDisplayName = displayName => {
  if (displayName.length < 3) {
    throwError('DisplayName length must be 3 at minimum', 422);
  }
  if (displayName.length > 60) {
    throwError('DisplayName length must be 60 at maximum', 422);
  }
};
