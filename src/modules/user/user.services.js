import { User } from './user.model';

export const signIn = async data => {
  const { username, password } = data;

  const user = await User.findByCredentials(username, password);
  const token = await user.generateAuthToken();

  return { token, user };
};

export const signUp = async data => {
  const { username, password } = data;

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
