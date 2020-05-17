import userRouter from './user/user.router';

export default app => {
  app.use('/users', userRouter);
};
