import express from 'express';

import { configDatabase, configGraphql, configMiddlewares } from './configs';

const app = express();

configDatabase(app); // Connect to MongoDB
configMiddlewares(app); // Included auth middleware
configGraphql(app); // Apply graphql middleware (api at /graphql)

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  const status = error.statusCode || 500;
  const { message, data } = error;
  res.status(status).json({ data, message });
});

export default app;
