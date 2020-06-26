import { User } from './user.model';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUsername,
} from './user.validators';

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

  const token = await user.generateAuthToken(); // included saving

  return { token, user };
};

export const getUsers = async () => {
  const users = await User.find({});
  return users;
};

export const updateUser = async (user, data) => {
  const { username } = data;

  validateUsername(username);

  user.username = username;

  const updatedUser = await user.save();
  return updatedUser;
};
