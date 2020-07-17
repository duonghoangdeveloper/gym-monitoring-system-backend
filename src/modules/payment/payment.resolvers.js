import {
  checkBelongingness,
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import { getUserById } from '../user/user.services';
import {
  createPayment,
  deletePayment,
  getPaymentById,
  getPayments,
  updatePayment,
} from './payment.services';

export const Mutation = {
  async createPayment(_, { data }, { req }) {
    const creator = checkRole(req.user, [
      'MANAGER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);
    const createdPayment = await createPayment({
      ...data,
      creatorId: creator._id.toString(),
    });
    return generateDocumentPayload(createdPayment);
  },

  async deletePayment(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const paymentToDelete = await getPaymentById(_id);
    const deletedPayment = await deletePayment(paymentToDelete);
    return generateDocumentPayload(deletedPayment);
  },

  async updatePayment(_, { _id, data }, { req }) {
    const creator = checkRole(req.user, [
      'MANAGER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);
    const paymentToUpdate = await getPaymentById(_id);
    const updatedPayment = await updatePayment(paymentToUpdate, {
      ...data,
      creatorId: creator._id.toString(),
    });
    return generateDocumentPayload(updatedPayment);
  },
};

export const Query = {
  async payment(_, { _id }, { req }) {
    const user = checkRole(req.user, [
      'CUSTOMER',
      'MANAGER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);
    const payment = await getPaymentById(_id);

    if (user.role === 'CUSTOMER') {
      checkBelongingness(payment, user._id.toString(), 'customer');
    }

    return generateDocumentPayload(payment);
  },
  async payments(_, { query }, { req }) {
    const user = checkRole(req.user, [
      'CUSTOMER',
      'MANAGER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);

    if (user.role === 'CUSTOMER') {
      const customerPayments = await getPayments({
        ...query,
        filter: { customer: [user._id.toString()] },
      });
      return generateDocumentsPayload(customerPayments);
    }

    const payments = await getPayments(query);
    return generateDocumentsPayload(payments);
  },
};

export const Payment = {
  async creator({ creator }, _, { req }) {
    // checkRole(req.user, ['CUSTOMER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const foundCreator = await getUserById(creator);
    return generateDocumentPayload(foundCreator);
  },

  async customer({ customer }, _, { req }) {
    // checkRole(req.user, ['CUSTOMER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const foundCustomer = await getUserById(customer);
    return generateDocumentPayload(foundCustomer);
  },
};
