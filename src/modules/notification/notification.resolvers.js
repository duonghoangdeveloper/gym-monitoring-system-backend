import {
  checkRole,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import { getUserById } from '../user/user.services';
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  updateNotification,
  // sendNotificationNotification,
  // sendNotificationNotificationToOnlineTrainers,
} from './notification.services';

export const Mutation = {
  async createNotification(_, { data }) {
    const createdNotification = await createNotification(data);
    return generateDocumentPayload(createdNotification);
  },

  async deleteNotification(_, { _id }, { req }) {
    checkRole(req.user, ['GYM_OWNER', 'SYSTEM_ADMIN']);
    const notificationToDelete = await getNotificationById(_id);
    const deletedNotification = await deleteNotification(notificationToDelete);
    return generateDocumentPayload(deletedNotification);
  },

  async updateNotification(_, { _id, data }, { req }) {
    checkRole(req.user);
    const notificationToUpdate = await getNotificationById(_id);
    const updatedNotification = await updateNotification(
      notificationToUpdate,
      data
    );
    return generateDocumentPayload(updatedNotification);
  },

  // async sendWaringsNotification(_, { deviceTokens }, { req }) {
  //   await sendNotificationNotificationToOnlineTrainers(null);
  //   return null;
  // },
};

export const Query = {
  async notification(_, { _id }, { req }) {
    checkRole(req.user);
    const notification = await getNotificationById(_id);
    return generateDocumentPayload(notification);
  },
  async notifications(_, { query }, { req }) {
    checkRole(req.user);
    const notifications = await getNotifications(query);
    return generateDocumentsPayload(notifications);
  },
};

export const Notification = {
  async user({ user }) {
    const foundUser = await getUserById(user);
    return generateDocumentPayload(foundUser);
  },
};
