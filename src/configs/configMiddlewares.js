import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';

import auth from '../middlewares/auth';

export default app => {
  app.use(morgan('tiny')); // Request log
  app.use(bodyParser.json({ limit: '1mb' })); // Parse body to JSON
  app.use(cors()); // CORS
  app.use(auth); // Decode JWT token
};
