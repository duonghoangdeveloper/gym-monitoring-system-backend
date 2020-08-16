import { Expo } from 'expo-server-sdk';
import isNil from 'lodash.isnil';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { getAllOnlineTrainer } from '../user/user.services';
import { Notification } from './notification.model';
import { validateUserRequired } from './notification.validators';

const refreshStatus = async notification => {
  if (notification.status === 'NEW') {
    notification.status = 'SEEN';
    const updatedNotification = await notification.save();
    return updatedNotification;
  }
  return notification;
};

export const getNotificationById = async (_id, projection) => {
  const notification = getDocumentById('Notification', _id, projection);
  await refreshStatus(notification);
  return notification;
};

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

export const sendNotification = async (pushTokens, notification) => {
  const expo = new Expo();

  const messages = [];
  for (const pushToken of pushTokens) {
    console.log(pushToken);
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
    }
    messages.push({
      body: 'This is a test notification',
      data: { withSome: 'data' },
      sound: 'default',
      to: pushToken,
    });
  }
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

export const sendNotificationToOnlineTrainers = async notification => {
  const expo = new Expo();
  const trainers = await getAllOnlineTrainer();
  console.log(123, trainers);
  const trainersPushTokens = trainers.map(({ deviceToken }) => deviceToken);
  console.log(trainersPushTokens);
  const messages = [];
  for (const pushToken of trainersPushTokens) {
    console.log(pushToken);
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
    }
    messages.push({
      body: 'This is notification notification',
      data: { withSome: 'data' },
      sound: 'default',
      to: pushToken,
    });
  }
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

// setInterval(() => {
//   sendNotificationNotification();
// }, 20000);
