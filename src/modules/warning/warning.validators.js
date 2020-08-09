import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateCustomerRequired = async customerId => {
  const customerExists = await User.exists({
    _id: customerId,
    role: 'CUSTOMER',
  });
  if (!customerExists) {
    throwError('Customer not found', 404);
  }
};

export const validateSupporterRequired = async staffId => {
  const staffExists = await User.exists({
    _id: staffId,
    role: 'GYM_OWNER' || 'SYSTEM_ADMIN' || 'TRAINER',
  });
  if (staffExists) {
    throwError('Staff not found', 404);
  }
};
