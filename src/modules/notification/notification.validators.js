import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateUserRequired = async userId => {
  const userExists = await User.exists({
    _id: userId,
  });
  if (!userExists) {
    throwError('User not found', 404);
  }
};
