import { userRoles } from '../../common/enums';
import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
  throwError,
  validateField,
} from '../../common/services';
import { getFeedbacks } from '../feedback/feedback.services';
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
  async changeOnlineStatus(_, { _id, status }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const changedStatusUser = await getUserById(_id);
    checkAuthorized(changedStatusUser, req.user);
    const changedUser = await changeUserStatus(changedStatusUser, status);
    return changedUser;
  },
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
    const updatedUser = await updateUser(_id, userToUpdate, data);
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
  async validateUser(_, { data }) {
    const errorMapping = {};

    (
      await Promise.all(
        Object.keys(data).map(async key => ({
          errors: await validateField('User', key, data[key]),
          key,
        }))
      )
    ).forEach(({ errors, key }) => (errorMapping[key] = errors));

    return errorMapping;
  },
};

export const User = {
  async feedbacks({ _id: userId }, { query }, { req }) {
    const feedbacksQuery = {
      ...query,
      filter: {
        ...query?.filter,
        customer: [userId],
      },
    };

    try {
      checkRole(req.user, ['CUSTOMER']);
      if (req.user._id.toString() === userId) {
        const { documents, total } = await getFeedbacks(feedbacksQuery);
        return generateDocumentsPayload({ documents, total });
      }
    } catch (e) {
      // Do nothing
    }

    return generateDocumentsPayload({ documents: [], total: 0 });
  },
};
