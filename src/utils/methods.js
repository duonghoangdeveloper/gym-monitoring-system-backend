import { userRoles } from './enums';

// Throw error, using mainly in controllers
export const throwError = (message, statusCode = 500, data) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  throw error;
};

// Check if user exist and has appropriate role
export const checkRole = (user, roles = userRoles) => {
  if (!user) {
    throwError('Unauthorized', 401);
  }

  if (!roles.includes(user.role)) {
    throwError('Unauthorized', 401);
  }
};
