import validator from 'validator';

import { Package } from '../../common/models';
import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateCreatorExists = async creatorId => {
  const creatorExists = await User.exists({ _id: creatorId });
  if (!creatorExists) {
    throwError('Creator not found', 404);
  }
};
export const validateCustomerExists = async customerId => {
  const customerExists = await User.exists({ _id: customerId });
  if (!customerExists) {
    throwError('Customer not found', 404);
  }
};
export const validatePackageExists = async packageId => {
  const packageExists = await Package.exists({ _id: packageId });
  if (!packageExists) {
    throwError('Package not found', 404);
  }
};
