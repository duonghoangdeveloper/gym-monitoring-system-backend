import { userRoles } from '../../common/enums';
import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
  throwError,
} from '../../common/services';
import {
  createUser,
  getUserById,
  getUsers,
  signIn,
  signOut,
  updatePassword,
  updateUser,
} from './user.services';

export const Mutation = {
  async createUser(_, { data }, { req }) {
    console.log(data);
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const createdUser = await createUser(data);
    return generateDocumentPayload(createdUser);
  },
<<<<<<< HEAD
  async deleteUser(_, { _id }, { req }) {
    checkRole(req.user);
    const userToDelete = await getUserById(_id);
    const deletedUser = await deleteUser(userToDelete);
    return generateDocumentPayload(deletedUser);
  },

=======
>>>>>>> master
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
    if (
      userRoles.indexOf(req.user.role) < userRoles.indexOf(userToUpdate.role)
    ) {
      throwError(
        `${req.user.role.replace(/^./, char =>
          char.toUpperCase()
        )} cannot update ${userToUpdate.role}`,
        401
      );
    }
    const updatedUser = await updateUser(userToUpdate, data);
    return generateDocumentPayload(updatedUser);
  },
};

export const Query = {
  async auth(_, __, { req }) {
    const user = checkRole(req.user);
    return generateDocumentPayload(user);
  },
  async findUser(_, { _id }, { req }) {
    checkRole(req.user);
    const userToFind = await getUserById(_id);
    // const findUser = await getUsers(userToFind);
    return generateDocumentPayload(userToFind);
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
