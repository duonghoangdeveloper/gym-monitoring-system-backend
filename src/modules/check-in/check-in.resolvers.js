import {
  checkBelongingness,
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import { getUserById } from '../user/user.services';
import {
  deleteCheckIn,
  getCheckInById,
  getCheckIns,
} from './check-in.services';

export const Mutation = {
  async deleteCheckIn(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const checkInToDelete = await getCheckInById(_id);
    const deletedCheckIn = await deleteCheckIn(checkInToDelete);
    return generateDocumentPayload(deletedCheckIn);
  },
};

export const Query = {
  async checkIn(_, { _id }, { req }) {
    const user = checkRole(req.user, [
      'CUSTOMER',
      'MANAGER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);
    const checkIn = await getCheckInById(_id);

    if (user.role === 'CUSTOMER') {
      checkBelongingness(checkIn, user._id.toString(), 'user');
    }

    return generateDocumentPayload(checkIn);
  },
  async checkIns(_, { query }, { req }) {
    const user = checkRole(req.user, [
      'CUSTOMER',
      'MANAGER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);

    if (user.role === 'CUSTOMER') {
      const customerCheckIns = await getCheckIns({
        ...query,
        filter: { user: [user._id.toString()] },
      });
      return generateDocumentsPayload(customerCheckIns);
    }

    const checkIns = await getCheckIns(query);
    return generateDocumentsPayload(checkIns);
  },
};

export const CheckIn = {
  async user({ user }) {
    const foundUser = await getUserById(user);
    return generateDocumentPayload(foundUser);
  },
};
