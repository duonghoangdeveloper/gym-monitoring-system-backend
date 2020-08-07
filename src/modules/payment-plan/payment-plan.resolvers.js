import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createPaymentPlan,
  deletePaymentPlan,
  getPaymentPlanById,
  getPaymentPlans,
  updatePaymentPlan,
} from './payment-plan.services';

export const Mutation = {
  async createPaymentPlan(_, { data }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const createdPaymentPlan = await createPaymentPlan(data);
    return generateDocumentPayload(createdPaymentPlan);
  },
  async deletePaymentPlan(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const paymentPlanToDelete = await getPaymentPlanById(_id);
    const deletedPaymentPlan = await deletePaymentPlan(paymentPlanToDelete);
    return generateDocumentPayload(deletedPaymentPlan);
  },
  async updatePaymentPlan(_, { _id, data }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const paymentPlanToUpdate = await getPaymentPlanById(_id);
    const updatedPaymentPlan = await updatePaymentPlan(
      paymentPlanToUpdate,
      data
    );
    return generateDocumentPayload(updatedPaymentPlan);
  },
};

export const Query = {
  async paymentPlan(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const _paymentPlan = await getPaymentPlanById(_id);
    return generateDocumentPayload(_paymentPlan);
  },
  async paymentPlans(_, { query }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const _paymentPlans = await getPaymentPlans(query);
    return generateDocumentsPayload(_paymentPlans);
  },
};
