import express from 'express';

import { configDatabase, configMiddlewares } from './configs';

const app = express();

configDatabase(app); // Connect to MongoDB Atlas
configMiddlewares(app); // Included auth middleware

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  const status = error.statusCode || 500;
  const { message } = error;
  const { data } = error;
  res.status(status).json({ message, data });
});

export default app;
