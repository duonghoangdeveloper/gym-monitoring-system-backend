import express from 'express';

import { configDatabase, configMiddlewares, configRouters } from './configs';

const app = express();

configDatabase(app); // Connect to MongoDB
configMiddlewares(app); // Included auth middleware
configRouters(app); // Apply routers in modules

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  const status = error.statusCode || 500;
  const { message, data } = error;
  res.status(status).json({ message, data });
});

console.log('master');

export default app;
