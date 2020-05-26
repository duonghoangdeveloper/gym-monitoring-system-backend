import { Router } from 'express';

import { generateRoleValidator, catchErrorWrapper } from '../../middlewares';
import {
  signIn,
  signUp,
  signOut,
  signOutAll,
  getUsers,
} from './user.controllers';
import * as userValidators from './user.validators';
import { checkRole } from '../../utils/methods';

const userRouter = new Router();

// Get all users
userRouter.get(
  '/',
  catchErrorWrapper(async (req, res) => {
    checkRole(req.user, ['ADMIN']);
    const users = await getUsers();
    res.status(200).send({ users });
  })
);

// Sign in
userRouter.post(
  '/signIn',
  userValidators.signIn,
  catchErrorWrapper(async (req, res) => {
    const { user, token } = await signIn(req.body);
    res.status(200).send({ user, token });
  })
);

// Sign up
userRouter.post(
  '/signUp',
  userValidators.signUp,
  catchErrorWrapper(async (req, res) => {
    const { user, token } = await signUp(req.body);
    res.status(201).send({ user, token });
  })
);

// Sign out
userRouter.post(
  '/signOut',
  generateRoleValidator(),
  catchErrorWrapper(async (req, res) => {
    const user = await signOut(req.user, req.token);
    res.status(200).send(user);
  })
);

// Sign out all
userRouter.post(
  '/signOutAll',
  generateRoleValidator(),
  catchErrorWrapper(async (req, res) => {
    const user = await signOutAll(req.user);
    res.status(200).send(user);
  })
);

export default userRouter;
