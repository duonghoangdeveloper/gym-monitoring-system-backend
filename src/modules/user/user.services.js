import bcrypt from 'bcryptjs';
import isNil from 'lodash.isnil';

import { userRoles } from '../../common/enums';
import {
  getDocumentById,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { User } from './user.model';
import {
  validateDisplayName,
  validateEmail,
  validateGender,
  validatePassword,
  validatePhone,
  validateRole,
  validateUsername,
} from './user.validators';

export const getUserById = async (_id, projection) =>
  getDocumentById('User', _id, projection);

export const signIn = async data => {
  const { password, username } = data;

  const user = await User.findByCredentials(username, password);
  const token = await user.generateAuthToken();

  return { token, user };
};

export const signOut = async (user, token) => {
  user.tokens = user.tokens.filter(t => t !== token);
  const signedOutUser = await user.save();
  return signedOutUser;
};

export const signOutAll = async user => {
  user.tokens = [];
  const signedOutUser = await user.save();
  return signedOutUser;
};

export const createUser = async data => {
  const { displayName, email, gender, password, phone, role, username } = data;

  validateUsername(username);
  validatePassword(password);

  if (!isNil(email)) {
    validateEmail(email);
  }

  if (!isNil(phone)) {
    validatePhone(phone);
  }

  if (!isNil(role)) {
    validateRole(role);
  }

  if (!isNil(displayName)) {
    validateDisplayName(displayName);
  }

  const user = new User({
    displayName,
    email,
    gender,
    password,
    phone,
    role,
    username,
  });

  const createdUser = await user.save();
  return createdUser;
};

export const getUsers = async (query, initialQuery) =>
  mongooseQuery('User', query, initialQuery);

export const updateUser = async (user, data) => {
  const { displayName, email, gender, phone, role, username } = data;

  if (!isNil(username)) {
    validateUsername(username);
    user.username = username;
  }

  if (!isNil(displayName)) {
    validateDisplayName(displayName);
    user.displayName = displayName;
  }

  if (!isNil(gender)) {
    validateGender(gender);
    user.gender = gender;
  }

  if (!isNil(email)) {
    validateEmail(email);
    user.email = email;
  }

  if (!isNil(phone)) {
    validatePhone(phone);
    user.phone = phone;
  }

  if (!isNil(role)) {
    validateRole(role);
    user.role = role;
  }

  const updatedUser = await user.save();
  return updatedUser;
};

export const checkAuthorized = (userToUpdate, userUpdate) => {
  if (
    userRoles.indexOf(userUpdate.role) < userRoles.indexOf(userToUpdate.role) &&
    userRoles.indexOf(userUpdate.role) > 1
  ) {
    throwError('Unauthorized', 401);
  }
};

export const changeUserStatus = async (user, status) => {
  user.isActive = status;
  const changedStatusUser = await user.save();
  return changedStatusUser;
};

export const deleteUser = async user => {
  const deletedUser = await user.remove();
  return deletedUser;
};

export const updatePassword = async (user, data) => {
  const { newPassword, oldPassword } = data;

  validatePassword(newPassword);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throwError('The old password is not correct', 400, null);
  }

  user.password = newPassword;

  const updatedUser = await user.save();
  return updatedUser;
};
