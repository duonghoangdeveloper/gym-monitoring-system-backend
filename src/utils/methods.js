// Throw error, using mainly in controllers
export const throwError = (message, statusCode = 500, data) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  throw error;
};
