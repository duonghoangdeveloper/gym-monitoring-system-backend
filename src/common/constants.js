import jwt from 'jsonwebtoken';

export const S3_BUCKET = 'gym-monitoring-system';

export const PYTHON_SERVER_URI_APIS = {
  CHECK_IN: 'http://localhost:8000/check-in/',
  DETECT_BARBELLS: 'http://localhost:8001/detect-barbells/',
  RECOGNIZE_PEOPLE: 'http://localhost:8000/recognize-people/',
};

export const TOKEN = jwt.sign(
  { message: 'Hello world!' },
  process.env.JWT_SECRET
);
