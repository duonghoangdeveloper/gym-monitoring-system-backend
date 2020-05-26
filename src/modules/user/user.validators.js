import { check } from 'express-validator';

import { validationHandler } from '../../middlewares';

const USER_CHECKS = {
  email: check('email').isEmail(),
  password: check('password').isLength({ min: 6, max: 30 }),
  displayName: check('displayName').isLength({ min: 3, max: 60 }),
};

export const signIn = [
  USER_CHECKS.email,
  USER_CHECKS.password,
  validationHandler,
];

export const signUp = [
  USER_CHECKS.email,
  USER_CHECKS.password,
  USER_CHECKS.displayName.optional(),
  validationHandler,
];
