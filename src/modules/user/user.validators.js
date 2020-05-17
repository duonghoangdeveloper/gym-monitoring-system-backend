import { check } from 'express-validator';

import { validationHandler } from '../../middlewares';

const USER_CHECKS = {
  email: check('username').isEmail(),
  password: check('password').isLength({ min: 6, max: 30 }),
  displayName: check('displayName').isLength({ min: 3, max: 60 }),
};

export const signIn = [
  USER_CHECKS.email.optional(),
  USER_CHECKS.password.optional(),
  validationHandler,
];

export const signUp = [
  USER_CHECKS.email.optional(),
  USER_CHECKS.password.optional(),
  USER_CHECKS.displayName.optional(),
  validationHandler,
];
