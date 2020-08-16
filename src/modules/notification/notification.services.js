import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { Notification } from './notification.model';
import { validateUserRequired } from './notification.validators';

export const getNotificationById = async (_id, projection) =>
  getDocumentById('Notification', _id, projection);

export const getNotifications = async (query, initialFind) =>
  mongooseQuery('Notification', query, initialFind);

export const createNotification = async data => {
  const { content, userId } = data;

  if (!isNil(userId)) {
    validateUserRequired(userId);
  }

  const notification = new Notification({
    content,
    status: 'NEW',
    user: userId,
  });

  const createdNotification = await notification.save();
  return createdNotification;
};

export const updateNotification = async (notification, data) => {
  const { status } = data;
  notification.status = status;
  const updatedNotification = await notification.save();
  return updatedNotification;
};

export const deleteNotification = async notification => {
  const deletedNotification = await notification.remove();
  return deletedNotification;
};
