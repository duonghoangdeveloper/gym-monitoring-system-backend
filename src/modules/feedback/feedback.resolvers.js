import {
  checkBelongingness,
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createFeedback,
  deleteFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedback,
} from './feedback.services';

export const Mutation = {
  async createFeedback(_, { data }, { req }) {
    const customer = checkRole(req.user, ['CUSTOMER']);
    const createdFeedback = await createFeedback(customer, data);
    return generateDocumentPayload(createdFeedback);
  },
  async deleteFeedbackByAdmin(_, { _id }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const feedbackToDelete = await getFeedbackById(_id);
    const deletedFeedback = await deleteFeedback(feedbackToDelete);
    return generateDocumentPayload(deletedFeedback);
  },
  async deleteFeedbackByCustomer(_, { _id }, { req }) {
    checkRole(req.user, ['CUSTOMER']);
    const feedbackToDelete = await getFeedbackById(_id);
    checkBelongingness(feedbackToDelete, req.user._id);
    const deletedFeedback = await deleteFeedback(feedbackToDelete);
    return generateDocumentPayload(deletedFeedback);
  },
  async updateFeedbackByCustomer(_, { _id, data }, { req }) {
    checkRole(req.user, ['CUSTOMER']);
    const feedbackToUpdate = await getFeedbackById(_id);
    checkBelongingness(feedbackToUpdate, req.user._id);
    const updatedFeedback = await updateFeedback(feedbackToUpdate, data);
    return generateDocumentPayload(updatedFeedback);
  },
};

export const Query = {
  async feedback(_, { _id }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const feedback = await getFeedbackById(_id);
    return generateDocumentPayload(feedback);
  },
  async feedbacks(_, { query }, { req }) {
    checkRole(req.user, ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const { documents, total } = await getFeedbacks(query);
    return generateDocumentsPayload({ documents, total });
  },
};