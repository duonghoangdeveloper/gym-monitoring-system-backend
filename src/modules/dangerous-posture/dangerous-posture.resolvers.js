import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import { getDangerousPostureTypeById } from '../dangerous-posture-type/dangerous-posture-type.services';
import {
  createDangerousPosture,
  deleteDangerousPosture,
  getDangerousPostureById,
  getDangerousPostures,
  updateDangerousPosture,
} from './dangerous-posture.services';

export const Mutation = {
  async createDangerousPosture(_, { data }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const createdDangerousPosture = await createDangerousPosture(data);
    console.log(createdDangerousPosture);
    return generateDocumentPayload(createdDangerousPosture);
  },
  async deleteDangerousPosture(_, { _id }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostureToDelete = await getDangerousPostureById(_id);
    const deletedDangerousPosture = await deleteDangerousPosture(
      dangerousPostureToDelete
    );
    return generateDocumentPayload(deletedDangerousPosture);
  },
  async updateDangerousPosture(_, { _id, data }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostureToUpdate = await getDangerousPostureById(_id);
    const updatedDangerousPosture = await updateDangerousPosture(
      dangerousPostureToUpdate,
      data
    );
    return generateDocumentPayload(updatedDangerousPosture);
  },
};

export const Query = {
  async dangerousPosture(_, { _id }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPosture = await getDangerousPostureById(_id);
    return generateDocumentPayload(dangerousPosture);
  },
  async dangerousPostures(_, { query }, { req }) {
    checkRole(req.user, ['TRAINER']);
    const dangerousPostures = await getDangerousPostures(query);
    return generateDocumentsPayload(dangerousPostures);
  },
};
export const DangerousPosture = {
  async dangerousPostureType({ dangerousPostureType }, _, { req }) {
    // checkRole(req.user, ['CUSTOMER', 'MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN']);
    const foundDangerousPostureType = await getDangerousPostureTypeById(
      dangerousPostureType
    );
    return generateDocumentPayload(foundDangerousPostureType);
  },
};
