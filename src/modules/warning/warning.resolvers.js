import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import { getUserById } from '../user/user.services';
import {
  acceptWarning,
  createWarning,
  deleteWarning,
  getWarningById,
  getWarnings,
  sendWarningNotification,
} from './warning.services';

export const Mutation = {
  async acceptWarning(_, { _id }, { req }) {
    const supporter = checkRole(req.user, [
      'TRAINER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);
    const warningToAccept = await getWarningById(_id);
    const acceptedWarning = await acceptWarning(warningToAccept, supporter);
    return generateDocumentPayload(acceptedWarning);
  },

  async createWarning(_, { data }) {
    const createdWarning = await createWarning(data);
    return generateDocumentPayload(createdWarning);
  },

  async deleteWarning(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const warningToDelete = await getWarningById(_id);
    const deletedWarning = await deleteWarning(warningToDelete);
    return generateDocumentPayload(deletedWarning);
  },
  async sendWaringsNotification(_, { deviceTokens }, { req }) {
    await sendWarningNotification(deviceTokens, null);
    return null;
  },
};

export const Query = {
  async warning(_, { _id }, { req }) {
    checkRole(req.user);
    const warning = await getWarningById(_id);
    return generateDocumentPayload(warning);
  },
  async warnings(_, { query }, { req }) {
    checkRole(req.user);
    const warnings = await getWarnings(query);
    return generateDocumentsPayload(warnings);
  },
};

export const Warning = {
  async customer({ customer }, _, { req }) {
    // checkRole(req.user, ['CUSTOMER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const foundCustomer = await getUserById(customer);
    return generateDocumentPayload(foundCustomer);
  },

  async supporter({ supporter }, _, { req }) {
    // checkRole(req.user, ['CUSTOMER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const foundCreator = await getUserById(supporter);
    return generateDocumentPayload(foundCreator);
  },
};
