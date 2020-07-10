/* eslint-disable simple-import-sort/sort */
import express from 'express';

import {
  configDatabase,
  configGraphQL,
  configMiddlewares,
  configSocket,
} from './configs';

const app = express();

configDatabase(app); // Connect to MongoDB
configMiddlewares(app); // Included auth middleware
configGraphQL(app); // Apply graphql middleware (api at /graphql)

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  const status = error.statusCode || 500;
  const { data, message } = error;
  res.status(status).json({ data, message });
});

export { app };
