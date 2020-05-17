import validator from 'validator';

export const email = {
  type: String,
  lowercase: true,
  trim: true,
  validate(value) {
    if (!validator.isEmail(value)) {
      throw new Error('Email is invalid');
    }
  },
};

export const url = {
  type: String,
  validate(value) {
    if (!validator.isURL(value)) {
      throw new Error('URL is invalid');
    }
  },
};

export const float = {
  type: Number,
  default: 0,
  validate: {
    validator(value) {
      return !Number.isNaN(value) && Number.isFinite(value);
    },
    message: ({ value }) => `${value} is not a real number`,
  },
};

export const integer = {
  type: Number,
  default: 0,
  validate: {
    validator(value) {
      return Number.isInteger(value);
    },
    message: ({ value }) => `${value} is not an integer`,
  },
};

export const nonNegativeInteger = {
  type: Number,
  default: 0,
  validate: {
    validator(value) {
      return Number.isInteger(value) && value >= 0;
    },
    message: ({ value }) => `${value} is not a non-negative integer`,
  },
};

export const positiveInteger = {
  type: Number,
  default: 1,
  validate: {
    validator(value) {
      return Number.isInteger(value) && value > 0;
    },
    message: ({ value }) => `${value} is not a positive integer`,
  },
};

export const date = {
  type: Date,
  validate: {
    validator(value) {
      return (
        value.getUTCHours() === 0 &&
        value.getUTCMinutes() === 0 &&
        value.getUTCSeconds() === 0 &&
        value.getUTCMilliseconds() === 0
      );
    },
    message: ({ value }) => `${value} is not a valid date`,
  },
};

export const dateTime = {
  type: Date,
};
