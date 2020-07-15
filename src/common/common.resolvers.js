import { validateField } from './services';

export const Query = {
  async isConnected() {
    return true;
  },
  async validateBooleanField(_, { field, model, value }) {
    return validateField(model, field, value);
  },
  async validateFloatField(_, { field, model, value }) {
    return validateField(model, field, value);
  },
  async validateIntField(_, { field, model, value }) {
    return validateField(model, field, value);
  },
  async validateStringField(_, { field, model, value }) {
    return validateField(model, field, value);
  },
};
