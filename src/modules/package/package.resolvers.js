import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createPackage,
  deletePackage,
  getPackageById,
  getPackages,
  updatePackage,
} from './package.services';

export const Mutation = {
  async createPackage(_, { data }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const createdPackage = await createPackage(data);
    console.log(123, createdPackage);
    return generateDocumentPayload(createdPackage);
  },
  async deletePackage(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const packageToDelete = await getPackageById(_id);
    const deletedPackage = await deletePackage(packageToDelete);
    return generateDocumentPayload(deletedPackage);
  },
  async updatePackage(_, { _id, data }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const packageToUpdate = await getPackageById(_id);
    const updatedPackage = await updatePackage(packageToUpdate, data);
    return generateDocumentPayload(updatedPackage);
  },
};

export const Query = {
  async package(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const _package = await getPackageById(_id);
    return generateDocumentPayload(_package);
  },
  async packages(_, { query }, { req }) {
    // console.log(query);
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const _packages = await getPackages(query);
    return generateDocumentsPayload(_packages);
  },
};

export const Package = {
  // async feedbacks() {},
};
