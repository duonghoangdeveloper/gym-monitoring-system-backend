import { userRoles } from '../../common/enums';
import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
  throwError,
} from '../../common/services';
import {
  changeUserStatus,
  checkAuthorized,
  createUser,
  getUserById,
  getUsers,
  signIn,
  signOut,
  updatePassword,
  updateUser,
} from './user.services';

export const Mutation = {
  async changeUserStatus(_, { _id, status }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const changedStatusUser = await getUserById(_id);
    checkAuthorized(changedStatusUser, req.user);
    const changedUser = await changeUserStatus(changedStatusUser, status);
    return changedUser;
  },
  async createUser(_, { data }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    checkAuthorized(data, req.user);
    const createdUser = await createUser(data);
    return generateDocumentPayload(createdUser);
  },
  async signIn(_, { data }) {
    const { token, user } = await signIn(data);
    return generateAuthPayload({ document: user, token });
  },
  async signOut(_, __, { req }) {
    const user = await signOut(req.user, req.token);
    return generateDocumentPayload(user);
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
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const userToUpdate = await getUserById(_id);
    checkAuthorized(userToUpdate, req.user);
    // if (
    //   userRoles.indexOf(req.user.role) < userRoles.indexOf(userToUpdate.role)
    // ) {
    //   throwError(
    //     `${req.user.role.replace(/^./, char =>
    //       char.toUpperCase()
    //     )} cannot update ${userToUpdate.role}`,
    //     401
    //   );
    // }
    const updatedUser = await updateUser(userToUpdate, data);
    return generateDocumentPayload(updatedUser);
  },
};

export const Query = {
  async auth(_, __, { req }) {
    const user = checkRole(req.user);
    return generateDocumentPayload(user);
  },
  async users(_, { query }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const users = await getUsers(query);
    return generateDocumentsPayload(users);
  },
};

export const User = {
  // async feedbacks() {},
};
