import User from './user.model';

export const signIn = async data => {
  const { email, password } = data;

  const user = await User.findByCredentials(email, password);
  const token = await user.generateAuthToken();

  return { user, token };
};

export const signUp = async data => {
  const { email, password, displayName } = data;

  const user = new User({
    email,
    password,
    displayName,
  });

  const token = await user.generateAuthToken(); // included saving

  return { user, token };
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

export const getUsers = async () => {
  const users = await User.find({});
  return users;
};
