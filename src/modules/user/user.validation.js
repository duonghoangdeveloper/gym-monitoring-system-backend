import Joi from 'joi';

export const signIn = {
  body: {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .required(),
  },
};

export const signUp = {
  body: {
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .required(),
    displayName: Joi.string()
      .min(3)
      .max(60),
  },
};
