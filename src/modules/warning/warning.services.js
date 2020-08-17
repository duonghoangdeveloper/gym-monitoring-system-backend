import { Expo } from 'expo-server-sdk';
import isNil from 'lodash.isnil';
import moment from 'moment';

import { uploadBase64S3 } from '../../common/s3';
import { getDocumentById, mongooseQuery } from '../../common/services';
import { getAllOnlineTrainer } from '../user/user.services';
import { Warning } from './warning.model';
import {
  validateCustomerRequired,
  validateSupporterRequired,
} from './warning.validators';

const refreshStatus = async warning => {
  const createdAt = moment(warning.createdAt);
  const now = moment();
  const diff = now.diff(createdAt);
  const diffDuration = moment.duration(diff);

  if (diffDuration.minutes() > 5 && warning.status === 'PENDING') {
    warning.status = 'FAILED';
    const updatedWarning = await warning.save();
    return updatedWarning;
  }

  return warning;
};

export const getWarningById = async (_id, projection) => {
  const warning = getDocumentById('Warning', _id, projection);
  await refreshStatus(warning);
  return warning;
};
// update status of warning to FAILED / SUCCESSED

export const getWarnings = async (query, initialFind) => {
  const warnings = await mongooseQuery('Warning', query, initialFind);
  await Promise.all(
    Object.values(warnings.documents).map(async warning =>
      refreshStatus(warning)
    )
  );
  return warnings;
};

export const createWarning = async data => {
  const { content, customerId } = data;

  if (!isNil(customerId)) {
    validateCustomerRequired(customerId);
  }
  // validateImage(image);

  const warning = new Warning({
    content,
    customer: customerId,
    status: 'PENDING',
  });
  const s3Data = await uploadBase64S3(`warning/${warning._id}`, image);
  console.log(s3Data);
  warning.image = {
    key: s3Data.Key,
    url: s3Data.Location,
  };

  const createdWarning = await warning.save();
  return createdWarning;
};

export const acceptWarning = async (warning, supporter) => {
  const supporterId = supporter._id.toString();

  if (!isNil(supporterId)) {
    await validateSupporterRequired(supporterId);
    warning.supporter = supporterId;
  }
  warning.status = 'SUCCEEDED';

  const updatedWarning = await warning.save();
  return updatedWarning;
};

export const deleteWarning = async warning => {
  const deletedWarning = await warning.remove();
  return deletedWarning;
};

export const sendWarningNotification = async (pushTokens, warning) => {
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

export const sendWarningNotificationToOnlineTrainers = async warning => {
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
      body: 'This is warning notification',
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
//   sendWarningNotification();
// }, 20000);
