import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
// import { getUserById } from '../user/user.services';
import {
  createCamera,
  deleteCamera,
  getCameraById,
  getCameras,
  updateCamera,
} from './camera.services';

export const Mutation = {
  async createCamera(_, { data }, { req }) {
    checkRole(req.user, ['SYSTEM_ADMIN']);
    const createdCamera = await createCamera(data);
    return generateDocumentPayload(createdCamera);
  },

  async deleteCamera(_, { _id }, { req }) {
    checkRole(req.user, ['SYSTEM_ADMIN']);
    const cameraToDelete = await getCameraById(_id);
    const deletedCamera = await deleteCamera(cameraToDelete);
    return generateDocumentPayload(deletedCamera);
  },

  async updateCamera(_, { _id, data }, { req }) {
    checkRole(req.user, ['SYSTEM_ADMIN']);
    const cameraToUpdate = await getCameraById(_id);
    const updatedCamera = await updateCamera(cameraToUpdate, data);
    return generateDocumentPayload(updatedCamera);
  },
};

export const Query = {
  async camera(_, { _id }, { req }) {
    checkRole(req.user, ['TRAINER', 'MANAGER', 'SYSTEM_ADMIN']);
    const camera = await getCameraById(_id);
    return generateDocumentPayload(camera);
  },
  async cameras(_, { query }, { req }) {
    checkRole(req.user, ['TRAINER', 'MANAGER', 'SYSTEM_ADMIN']);
    const cameras = await getCameras(query);
    return generateDocumentsPayload(cameras);
  },
};

export const Camera = {};
