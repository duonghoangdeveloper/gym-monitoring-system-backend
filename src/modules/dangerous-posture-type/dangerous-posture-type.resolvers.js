import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createDangerousPostureType,
  deleteDangerousPostureType,
  getDangerousPostureTypeById,
  getDangerousPostureTypes,
  updateDangerousPostureType,
} from './dangerous-posture-type.services';

export const Mutation = {
  async createDangerousPostureType(_, { data }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const createdDangerousPostureType = await createDangerousPostureType(data);
    return generateDocumentPayload(createdDangerousPostureType);
  },
  async deleteDangerousPostureType(_, { _id }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostureTypeToDelete = await getDangerousPostureTypeById(_id);
    const deletedDangerousPostureType = await deleteDangerousPostureType(
      dangerousPostureTypeToDelete
    );
    return generateDocumentPayload(deletedDangerousPostureType);
  },
  async updateDangerousPostureType(_, { _id, data }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostureTypeToUpdate = await getDangerousPostureTypeById(_id);
    const updatedDangerousPostureType = await updateDangerousPostureType(
      dangerousPostureTypeToUpdate,
      data
    );
    return generateDocumentPayload(updatedDangerousPostureType);
  },
};

export const Query = {
  async dangerousPostureType(_, { _id }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostureType = await getDangerousPostureTypeById(_id);
    return generateDocumentPayload(dangerousPostureType);
  },
  async dangerousPostureTypes(_, { query }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostureTypes = await getDangerousPostureTypes(query);
    return generateDocumentsPayload(dangerousPostureTypes);
  },
};
