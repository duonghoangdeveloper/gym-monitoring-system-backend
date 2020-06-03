import validator from 'validator';

export const email = {
  lowercase: true,
  trim: true,
  type: String,
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
  default: 0,
  type: Number,
  validate: {
    message: ({ value }) => `${value} is not a real number`,
    validator(value) {
      return !Number.isNaN(value) && Number.isFinite(value);
    },
  },
};

export const integer = {
  default: 0,
  type: Number,
  validate: {
    message: ({ value }) => `${value} is not an integer`,
    validator(value) {
      return Number.isInteger(value);
    },
  },
};

export const nonNegativeInteger = {
  default: 0,
  type: Number,
  validate: {
    message: ({ value }) => `${value} is not a non-negative integer`,
    validator(value) {
      return Number.isInteger(value) && value >= 0;
    },
  },
};

export const positiveInteger = {
  default: 1,
  type: Number,
  validate: {
    message: ({ value }) => `${value} is not a positive integer`,
    validator(value) {
      return Number.isInteger(value) && value > 0;
    },
  },
};

export const date = {
  type: Date,
  validate: {
    message: ({ value }) => `${value} is not a valid date`,
    validator(value) {
      return (
        value.getUTCHours() === 0 &&
        value.getUTCMinutes() === 0 &&
        value.getUTCSeconds() === 0 &&
        value.getUTCMilliseconds() === 0
      );
    },
  },
};

export const dateTime = {
  type: Date,
};
