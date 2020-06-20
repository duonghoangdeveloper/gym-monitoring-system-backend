import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import { auth } from '../middlewares/auth';

export const configMiddlewares = app => {
  // app.use(morgan('tiny')); // Request log
  app.use(bodyParser.json({ limit: '1mb' })); // Parse body to JSON
  app.use(cors()); // CORS
  app.use(auth); // Decode JWT token
};
