// Throw error, using mainly in controllers
export const throwError = (message, code = 500, data) => {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  throw error;
};
