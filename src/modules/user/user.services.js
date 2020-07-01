import bcrypt from 'bcryptjs';

import {
  getDocumentById,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { User } from './user.model';
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateUsername,
} from './user.validators';

export const getUserById = async (_id, projection) =>
  getDocumentById('User', _id, projection);

export const signIn = async data => {
  const { username, password } = data;

  const user = await User.findByCredentials(username, password);
  const token = await user.generateAuthToken();

  return { token, user };
};

export const signUp = async data => {
  const { username, password } = data;

  validateUsername(username);
  validatePassword(password);

  const user = new User({
    password,
    username,
  });

  const token = await user.generateAuthToken(); // included saving

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
  const { username, password, gender, email, phone } = data;

  validateUsername(username);
  validatePassword(password);

  if (email) {
    validateEmail(email);
  }

  if (phone) {
    validatePhone(phone);
  }

  const user = new User({
    email,
    gender,
    password,
    phone,
    username,
  });

  const createdUser = await user.save();
  return createdUser;
};

export const getUsers = async (query, initialQuery) =>
  mongooseQuery('User', query, initialQuery);

export const updateUserProfile = async (user, data) => {
  const { username, displayName } = data;

  validateUsername(username);
  validateDisplayName(displayName);

  user.username = username;
  user.displayName = displayName;

  const updatedUser = await user.save();
  return updatedUser;
};

export const deleteUser = async user => {
  const deletedUser = await user.remove();
  return deletedUser;
};

export const updateUserPassword = async (user, data) => {
  const { oldPassword, newPassword } = data;
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throwError('The old password is not correct', 400, null);
  }
  validatePassword(newPassword);
  user.password = newPassword;
  const returnUser = await user.save();
  return returnUser;
};
