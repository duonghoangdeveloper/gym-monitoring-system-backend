import validator from 'validator';

import { userGenders, userRoles } from '../../common/enums';
import { throwError } from '../../common/services';
import { User } from './user.model';

export const validateUsername = async username => {
  if (username.length < 6) {
    throwError('Username length must be 6 at minimum', 422);
  }
  if (username.length > 30) {
    throwError('Username length must be 30 at maximum', 422);
  }
};

export const validateUsernameExists = async username => {
  const usernameExists = await User.exists({ activationToken: null, username });
  if (usernameExists) {
    throwError('Username already exists', 409);
  }
};

export const validateUsernameUpdate = async (_id, username) => {
  const userUpdate = await User.findOne({ _id });
  if (userUpdate.username !== username) {
    validateUsernameExists(username);
  }
};

export const validateEmailUpdate = async (_id, email) => {
  const userUpdate = await User.findOne({ _id });
  if (userUpdate.email !== email) {
    validateEmailExists(email);
  }
};

export const validatePhoneUpdate = async (_id, phone) => {
  const userUpdate = await User.findOne({ _id });
  if (userUpdate.phone !== phone) {
    validatePhoneExists(phone);
  }
};

export const validatePassword = async password => {
  if (password.length < 6) {
    throwError('Password length must be 6 at minimum', 422);
  }
  if (password.length > 30) {
    throwError('Password length must be 30 at maximum', 422);
  }
};

export const validateGender = async gender => {
  if (gender) {
    if (!userGenders.includes(gender)) {
      throwError('Gender is invalid', 422);
    }
  }
};

export const validateRole = async role => {
  if (!userRoles.includes(role)) {
    throwError('Role is invalid', 422);
  }
};

export const validateEmail = async email => {
  if (email && !validator.isEmail(email)) {
    throwError('Email is invalid', 422);
  }
};

export const validateEmailExists = async email => {
  const emailExists = await User.exists({ activationToken: null, email });
  if (email && emailExists) {
    throwError('Email already exists', 409);
  }
};

export const validatePhone = async phone => {
  if (phone && !validator.isMobilePhone(phone)) {
    throwError('Phone number is invalid', 422);
  }
};

export const validatePhoneExists = async phone => {
  const phoneExists = await User.exists({ activationToken: null, phone });
  if (phone && phoneExists) {
    throwError('Phone already existed', 409);
  }
};

export const validateDisplayName = async displayName => {
  if (displayName) {
    if (displayName.length < 3) {
      throwError('DisplayName length must be 3 at minimum', 422);
    }
    if (displayName.length > 60) {
      throwError('DisplayName length must be 60 at maximum', 422);
    }
  }
};

export const userValidatorMapping = {
  displayName: [validateDisplayName],
  email: [validateEmail, validateEmailExists],
  gender: [validateGender],
  password: [validatePassword],
  phone: [validatePhone, validatePhoneExists],
  role: [validateRole],
  username: [validateUsername, validateUsernameExists],
};
