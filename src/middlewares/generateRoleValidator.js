import * as enums from '../common/enums';
import { throwError } from '../common/services';

// Pass role list to return role validation middleware
export default (roles = enums.userRoles) => async (req, res, next) => {
  // No user
  if (!req.user) {
    throwError('Unauthorized', 401);
  }

  // Role not accepted
  if (!roles.includes(req.user.role)) {
    throwError('Unauthorized', 401);
  }

  next();
};
