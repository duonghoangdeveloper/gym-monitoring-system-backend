import validator from 'validator';

import { warningStatuses } from '../../common/enums';
import { throwError } from '../../common/services';
// import { Location } from '../user/location.model';
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

export const validateTitle = async title => {
  if (title.length > 50) {
    throwError('Title length must be 50 at maximum', 422);
  }
};

export const validateStatus = async status => {
  if (!warningStatuses.includes(status)) {
    throwError('Status is invalid', 422);
  }
};

export const validateImage = async image => {
  if (!validator.isURL(image)) {
    throwError('Image is invalid', 422);
  }
};

// export const validateLocationExists = async location => {
//   const locationExists = await Location.exists({ location });
//   if (!locationExists) {
//     throwError('Location not found', 404);
//   }
// };
