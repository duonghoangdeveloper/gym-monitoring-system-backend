import userRouter from '../modules/user/user.router';

export default app => {
  app.use('/users', userRouter);
};
