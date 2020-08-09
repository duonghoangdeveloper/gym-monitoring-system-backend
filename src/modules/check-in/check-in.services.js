import { uploadBase64S3 } from '../../common/s3';
import { getDocumentById, mongooseQuery } from '../../common/services';
import { CheckIn } from './check-in.model';
import { validateUserRequired } from './check-in.validators';

export const getCheckInById = async (_id, projection) =>
  getDocumentById('CheckIn', _id, projection);

export const getCheckIns = async (query, initialFind) =>
  mongooseQuery('CheckIn', query, initialFind);

export const createCheckIn = async (userId, base64) => {
  validateUserRequired(userId);

  const checkIn = new CheckIn({
    user: userId,
  });
  const s3Data = await uploadBase64S3(`check-in/${checkIn._id}`, base64);
  checkIn.image = {
    key: s3Data.Key,
    url: s3Data.Location,
  };

  const createdCheckIn = await checkIn.save();
  return createdCheckIn;
};

export const deleteCheckIn = async checkIn => {
  const deletedCheckIn = await checkIn.remove();
  return deletedCheckIn;
};
