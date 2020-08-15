import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateUserRequired = async customerId => {
  const customerExists = await User.exists({
    _id: customerId,
  });
  if (!customerExists) {
    throwError('User not found', 404);
  }
};
