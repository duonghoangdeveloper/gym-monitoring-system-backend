import validator from 'validator';

import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateExistCreator = async creatorId => {
  const creatorExists = await User.exists({ _id: creatorId });
  if (!creatorExists) {
    throwError('Creator not found', 404);
  }
};
export const validateExistCustomer = async customerId => {
  const customerExists = await User.exists({ _id: customerId });
  if (!customerExists) {
    throwError('Customer not found', 404);
  }
};
export const validateExistPackage = async packageId => {
  const packageExists = await User.exists({ _id: packageId });
  if (!packageExists) {
    throwError('Package not found', 404);
  }
};
