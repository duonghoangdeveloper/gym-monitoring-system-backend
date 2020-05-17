import { Router } from 'express';
import validate from 'express-validation';

import { generateRoleMiddleware } from '../../middlewares';
import { signIn, signUp, signOut, signOutAll } from './user.controllers';
import * as userValidation from './user.validation';

const userRouter = new Router();

// Sign in
userRouter.post(
  '/signIn',
  validate(userValidation.signIn),
  async (req, res) => {
    const { user, token } = await signIn(req.body);
    res.status(200).send({ user, token });
  }
);

// Sign up
userRouter.post(
  '/signUp',
  validate(userValidation.signUp),
  async (req, res) => {
    const { user, token } = await signUp(req.body);
    res.status(201).send({ user, token });
  }
);

// Sign out
userRouter.post('/signOut', generateRoleMiddleware(), async (req, res) => {
  const user = await signOut(req.user, req.token);
  res.status(200).send(user);
});

// Sign out all
userRouter.post('/signOutAll', generateRoleMiddleware(), async (req, res) => {
  const user = await signOutAll(req.user);
  res.status(200).send(user);
});

export default userRouter;
