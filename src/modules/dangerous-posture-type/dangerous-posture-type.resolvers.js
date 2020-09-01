import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import { getDangerousPostures } from '../dangerous-posture/dangerous-posture.services';
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

export const DangerousPostureType = {
  async dangerousPostures({ _id: dangerousPostureTypeId }, { query }, { req }) {
    const dangerousPosturesQuery = {
      ...query,
      filter: {
        ...query?.filter,
        dangerousPostureType: [dangerousPostureTypeId],
      },
    };
    try {
      checkRole(req.user, [
        'CUSTOMER',
        'TRAINER',
        'MANAGER',
        'GYM_OWNER',
        'SYSTEM_ADMIN',
      ]);

      const { documents, total } = await getDangerousPostures(
        dangerousPosturesQuery
      );
      return generateDocumentsPayload({ documents, total });
    } catch (e) {
      // Do nothing
    }

    return generateDocumentsPayload({ documents: [], total: 0 });
  },
};
