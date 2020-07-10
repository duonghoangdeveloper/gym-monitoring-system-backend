import bcrypt from 'bcryptjs';
import isNil from 'lodash.isnil';

import {
  getDocumentById,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { User } from './user.model';
import {
  validateDisplayName,
  validateEmail,
  validateEmailExists,
  validateGender,
  validatePassword,
  validatePhone,
  validateRole,
  validateUsername,
  validateUsernameExists,
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

  await validateUsername(username);
  await validateUsernameExists(username);
  await validatePassword(password);

  if (!isNil(email)) {
    await validateEmail(email);
    await validateEmailExists(email);
  }

  if (!isNil(phone)) {
    await validatePhone(phone);
  }

  if (!isNil(role)) {
    await validateRole(role);
  }

  if (!isNil(displayName)) {
    await validateDisplayName(displayName);
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

export const getUsers = async (query, initialFind) =>
  mongooseQuery('User', query, initialFind);

export const updateUser = async (user, data) => {
  const { displayName, email, gender, phone, role, username } = data;

  if (!isNil(username)) {
    await validateUsername(username);
    await validateUsernameExists(username);
    user.username = username;
  }

  if (!isNil(displayName)) {
    await validateDisplayName(displayName);
    user.displayName = displayName;
  }

  if (!isNil(gender)) {
    await validateGender(gender);
    user.gender = gender;
  }

  if (!isNil(email)) {
    await validateEmail(email);
    await validateEmailExists(email);
    user.email = email;
  }

  if (!isNil(phone)) {
    await validatePhone(phone);
    user.phone = phone;
  }

  if (!isNil(role)) {
    await validateRole(role);
    user.role = role;
  }

  const updatedUser = await user.save();
  return updatedUser;
};

export const deleteUser = async user => {
  const deletedUser = await user.remove();
  return deletedUser;
};

export const updatePassword = async (user, data) => {
  const { newPassword, oldPassword } = data;

  await validatePassword(newPassword);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throwError('The old password is not correct', 400, null);
  }

  user.password = newPassword;

  const updatedUser = await user.save();
  return updatedUser;
};
