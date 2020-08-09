import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateUserRequired = async userId => {
  const userExists = await User.exists({
    _id: userId,
    role: { $nin: ['SYSTEM_ADMIN'] },
  });
  if (!userExists) {
    throwError('User not found', 404);
  }
};
