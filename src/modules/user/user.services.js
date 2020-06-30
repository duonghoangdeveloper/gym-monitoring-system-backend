import { getDocumentById, mongooseQuery } from '../../common/services';
import { User } from './user.model';
import {
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
  validateEmail(email);
  validatePhone(phone);

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

export const updateProfile = async (user, data) => {
  const { username, password, avatar } = data;

  validateUsername(username);
  validatePassword(password);

  user.username = username;
  user.password = password;
  user.avatar = avatar;

  const updatedProfile = await user.save();
  return updatedProfile;
};

export const updateUser = async (user, data) => {
  const { role, email, phone } = data;

  validateEmail(email);
  validatePhone(phone);

  user.role = role;

  const updatedUser = await user.save();
  return updatedUser;
};

export const deleteUser = async user => {
  const deletedUser = await user.remove();
  return deletedUser;
};
