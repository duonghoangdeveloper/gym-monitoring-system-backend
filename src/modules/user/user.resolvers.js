import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  signIn,
  signOut,
  signUp,
  updatePassword,
  updateUser,
} from './user.services';

export const Mutation = {
  async createUser(_, { data }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const createdUser = await createUser(data);
    return generateDocumentPayload(createdUser);
  },
  async deleteUser(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const userToDelete = await getUserById(_id);
    const deletedUser = await deleteUser(userToDelete);
    return generateDocumentPayload(deletedUser);
  },
  async signIn(_, { data }) {
    const { token, user } = await signIn(data);
    return generateAuthPayload({ document: user, token });
  },
  async signOut(_, __, { req }) {
    const user = await signOut(req.user, req.token);
    return generateDocumentPayload(user);
  },
  async signUp(_, { data }) {
    const { token, user } = await signUp(data);
    return generateAuthPayload({ document: user, token });
  },
  async updatePassword(_, { data }, { req }) {
    const user = checkRole(req.user);
    const updatedUser = await updatePassword(user, data);
    return generateDocumentPayload(updatedUser);
  },
  async updateProfile(_, { data }, { req }) {
    const user = checkRole(req.user);
    const updatedProfile = await updateUser(user, data);
    return generateDocumentPayload(updatedProfile);
  },
  async updateUser(_, { _id, data }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const userToUpdate = await getUserById(_id);
    const updatedUser = await updateUser(userToUpdate, data);
    return generateDocumentPayload(updatedUser);
  },
};

export const Query = {
  async auth(_, __, { req }) {
    const user = checkRole(req.user, ['GYM_OWNER', 'TRAINEE']);
    return generateDocumentPayload(user);
  },
  async users(_, { query }, { req }) {
    checkRole(req.user);
    const users = await getUsers(query);
    return generateDocumentsPayload(users);
  },
};

export const User = {
  // async feedbacks() {},
};
