import axios from 'axios';

import { PYTHON_SERVER_URI_APIS, TOKEN } from '../../common/constants';
import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
  reloadFacesPython,
  throwError,
  validateField,
} from '../../common/services';
import { uploadFaces } from '../face/face.services';
import { getFeedbacks } from '../feedback/feedback.services';
import { createPayment, getPayments } from '../payment/payment.services';
import { getWarnings } from '../warning/warning.services';
import {
  activateUser,
  changeOnlineStatus,
  checkFacesEnough,
  checkUpdaterRoleAuthorization,
  countUsers,
  createDummyUser,
  createUser,
  deactivateUser,
  deleteUsers,
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
    checkRole(req.user, ['TRAINER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    if (req.user.role !== 'TRAINER') {
      const trainerToUpdate = await getUserById(_id);
      if (trainerToUpdate.role === 'TRAINER') {
        const updatedTrainer = await changeOnlineStatus(
          trainerToUpdate,
          status
        );
        return updatedTrainer;
      }
    } else {
      const updatedTrainer = await changeOnlineStatus(req.user, status);
      return updatedTrainer;
    }
    throwError('Only trainer online status can be updated', 400);
  },

  // create $amount of dummy user
  async createDummyUser(_, { amount, role }, { req }) {
    checkRole(req.user, ['SYSTEM_ADMIN']);
    const createdUsers = await createDummyUser(amount, role);
    return createdUsers;
  },

  async createUser(_, { data }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    checkUpdaterRoleAuthorization(req.user.role, data.role);
    checkFacesEnough(data.role, data.faces);
    const createdUser = await createUser(data);
    await uploadFaces(createdUser, data.faces);
    if (data.paymentPlanId && data.role === 'CUSTOMER') {
      await createPayment({
        creatorId: req.user._id.toString(),
        customerId: createdUser._id.toString(),
        paymentPlanId: data.paymentPlanId,
      });
    }
    reloadFacesPython();
    return generateDocumentPayload(createdUser);
  },

  async deactivateUser(_, { _id }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const user = await getUserById(_id);
    checkUpdaterRoleAuthorization(req.user.role, user.role);
    const removedUser = await deactivateUser(user);
    return generateDocumentPayload(removedUser);
  },

  // Delete all user base on query input
  async deleteUsers(_, { query }, { req }) {
    checkRole(req.user, ['SYSTEM_ADMIN']);
    const users = await getUsers(query);
    const deletedUsers = await deleteUsers(users.documents);
    return deletedUsers;
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
    checkUpdaterRoleAuthorization(req.user.role, userToUpdate.role);
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
  async usersCount(_, { query }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const usersCount = await countUsers(query);
    return usersCount || 0;
  },
  async usersCounts(_, { queries }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    console.log(queries);
    const usersCounts = Promise.all(queries.map(query => countUsers(query)));
    return usersCounts || [];
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

  async payments({ _id: userId }, { query }, { req }) {
    const paymentsQuery = {
      ...query,
      filter: {
        ...query?.filter,
        customer: [userId],
      },
    };

    try {
      checkRole(req.user, ['CUSTOMER']);
      if (req.user._id.toString() === userId) {
        const { documents, total } = await getPayments(paymentsQuery);
        return generateDocumentsPayload({ documents, total });
      }
    } catch (e) {
      // Do nothing
    }

    return generateDocumentsPayload({ documents: [], total: 0 });
  },

  async warnings({ _id: userId }, { query }, { req }) {
    const warningsQuery = {
      ...query,
      filter: {
        ...query?.filter,
        customer: [userId],
      },
    };

    try {
      checkRole(req.user, ['CUSTOMER']);
      if (req.user._id.toString() === userId) {
        const { documents, total } = await getWarnings(warningsQuery);
        return generateDocumentsPayload({ documents, total });
      }
    } catch (e) {
      // Do nothing
    }

    return generateDocumentsPayload({ documents: [], total: 0 });
  },
};
