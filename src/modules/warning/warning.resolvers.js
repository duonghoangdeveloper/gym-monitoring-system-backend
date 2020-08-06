import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createWarning,
  deleteWarning,
  getWarningById,
  getWarnings,
  updateWarning,
} from './warning.services';

export const Mutation = {
  async acceptWarning(_, { _id, data }, { req }) {
    const supporter = checkRole(req.user, [
      'TRAINER',
      'GYM_OWNER',
      'SYSTEM_ADMIN',
    ]);
    const warningToUpdate = await getWarningById(_id);
    const updatedWarning = await updateWarning(
      warningToUpdate,
      data,
      supporter
    );
    return generateDocumentPayload(updatedWarning);
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