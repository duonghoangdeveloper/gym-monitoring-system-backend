import { userRoles } from '../../common/enums';
import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
  throwError,
} from '../../common/services';
import { getFeedbacks } from '../feedback/feedback.services';
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
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
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
  async users(_, { query }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const users = await getUsers(query);
    return generateDocumentsPayload(users);
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
