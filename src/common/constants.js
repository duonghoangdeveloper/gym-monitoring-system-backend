export const S3_BUCKET = 'gym-monitoring-system';

export const PYTHON_SERVER_URI =
  process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
    ? 'http://localhost:8000'
    : '';
