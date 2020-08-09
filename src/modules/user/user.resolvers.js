import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
  throwError,
  validateField,
} from '../../common/services';
import { uploadFaces } from '../face/face.services';
import { getFeedbacks } from '../feedback/feedback.services';
import {
  activateUser,
  changeOnlineStatus,
  checkFacesEnough,
  checkUpdaterRoleAuthorization,
  createUser,
  deactivateUser,
  getUserById,
  getUsers,
  signIn,
  signOut,
  updateAvatarWithFileUpload,
  updatePassword,
  updateUser,
} from './user.services';

export const Mutation = {
  async activateUser(_, { _id }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const user = await getUserById(_id);
    checkUpdaterRoleAuthorization(req.user.role, user.role);
    const removedUser = await activateUser(user);
    return generateDocumentPayload(removedUser);
  },

  async changeOnlineStatus(_, { _id, status }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const trainerToUpdate = await getUserById(_id);
    if (trainerToUpdate.role === 'TRAINER') {
      const updatedTrainer = await changeOnlineStatus(trainerToUpdate, status);
      return updatedTrainer;
    }
    throwError('Only trainer online status can be updated', 400);
  },
  async createUser(_, { data }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    checkUpdaterRoleAuthorization(req.user.role, data.role);
    checkFacesEnough(data.role, data.faces);
    const createdUser = await createUser(data);
    await uploadFaces(createdUser, data.faces);
    return generateDocumentPayload(createdUser);
  },
  async deactivateUser(_, { _id }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const user = await getUserById(_id);
    checkUpdaterRoleAuthorization(req.user.role, user.role);
    const removedUser = await deactivateUser(user);
    return generateDocumentPayload(removedUser);
  },
  async signIn(_, { data }) {
    const { token, user } = await signIn(data);
    return generateAuthPayload({ document: user, token });
  },
  async signOut(_, __, { req }) {
    const user = await signOut(req.user, req.token);
    return generateDocumentPayload(user);
  },
  async updateAvatar(_, { data }, { req }) {
    const user = checkRole(req.user);
    const updatedUser = await updateAvatarWithFileUpload(user, data.avatar);
    return generateDocumentPayload(updatedUser);
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
    checkUpdaterRoleAuthorization(req.user.role, data.role);
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
    checkRole(req.user, ['CUSTOMER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
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
  async createdPayments({ _id: creatorId }, { query }, { req }) {
    // Role >= Manager moi duoc xem
  },

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

  async payments({ _id: customerId }, { query }, { req }) {
    // Role >= Manager: xem duoc
    // Role == Customer: chi xem duoc cua minh, nghia la customerId === user.id (user tu checkRole)
  },
};
