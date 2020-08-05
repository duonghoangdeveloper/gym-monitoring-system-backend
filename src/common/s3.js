import AWS from 'aws-sdk';

import { S3_BUCKET } from './constants';
import { throwError } from './services';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const uploadFileS3 = (
  key,
  stream,
  contentType = 'application/octet-stream'
) => {
  if (!key) {
    throwError('Key is not provided', 500);
  }

  const params = {
    ACL: 'public-read',
    Body: stream,
    Bucket: S3_BUCKET,
    ContentType: contentType,
    Key: key.toLowerCase(),
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (data) {
        resolve(data);
      }
    });
  });
};

export const deleteFileS3 = key => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (data) {
        resolve(data);
      }
    });
  });
};

export const getFileS3 = key => {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.headObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      if (data) {
        resolve(data);
      }
    });
  });
};

export const deleteDirectoryS3 = async dir => {
  const listParams = {
    Bucket: S3_BUCKET,
    Prefix: dir,
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: S3_BUCKET,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await deleteDirectoryS3(S3_BUCKET, dir);
};
