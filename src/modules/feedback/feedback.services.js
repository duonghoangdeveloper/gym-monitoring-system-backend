import {
  getDocumentById,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { getUserById } from '../user/user.services';
import { Feedback } from './feedback.model';
import { validateContent, validateTitle } from './feedback.validators';

export const getFeedbackById = async (_id, projection) =>
  getDocumentById('Feedback', _id, projection);

export const createFeedback = async (customer, data) => {
  const { content, staffIds, title } = data;

  validateContent(content);
  validateTitle(title);

  staffIds.forEach(_id => {
    getUserById(_id);
  });

  const feedback = new Feedback({
    content,
    customer: customer._id,
    staffIds,
    title,
  });

  const createdFeedback = await feedback.save();
  return createdFeedback;
};

export const getFeedbacks = async (query, initialQuery) =>
  mongooseQuery('Feedback', query, initialQuery);

export const updateFeedback = async (feedback, data) => {
  const { content, customerId, isActive, staffIds, title } = data;

  if (content) {
    validateContent(content);
    feedback.content = content;
  }
  if (ratingValue) {
    validateRating(ratingValue);
    feedback.ratingValue = ratingValue;
  }
  if (staffIds) {
    feedback.staffID = staffID;
  }
  if (customerID) {
    feedback.customerID = customerID;
  }
  if (isActive) {
    validateStatus(isActive);
    feedback.isActive = isActive;
  }
  if (title) {
    validateTitle(title);
    feedback.title = title;
  }

  const updatedFeedback = await feedback.save();
  return updatedFeedback;
};

export const deleteFeedback = async feedback => {
  const deletedFeedback = await feedback.remove();
  return deletedFeedback;
};
