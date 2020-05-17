import * as enums from '../utils/enums';
import { throwError } from '../utils/methods';

// Pass role list to return role validation middleware
export const generateRoleMiddleware = (roles = enums.userRoles) => async (
  req,
  res,
  next
) => {
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
