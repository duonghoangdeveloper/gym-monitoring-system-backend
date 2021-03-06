import bcrypt from 'bcryptjs';
import isNil from 'lodash.isnil';
// import request from 'request';
import moment from 'moment';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { userRoles } from '../../common/enums';
import { Payment } from '../../common/models';
import { deleteFileS3, getFileS3, uploadFileS3 } from '../../common/s3';
import {
  getDocumentById,
  mongooseCount,
  mongooseQuery,
  throwError,
} from '../../common/services';
import { sendWarningNotification } from '../warning/warning.services';
import { User } from './user.model';
import {
  validateDisplayName,
  validateEmail,
  validateEmailExists,
  validateEmailUpdate,
  validateGender,
  validatePassword,
  validatePhone,
  validatePhoneExists,
  validatePhoneUpdate,
  validateRole,
  validateUsername,
  validateUsernameExists,
  validateUsernameUpdate,
} from './user.validators';

export const countUsers = async (query, initialFind) =>
  mongooseCount('User', query, initialFind);

export const getUsers = async (query, initialFind) =>
  mongooseQuery('User', query, initialFind);

export const getUserById = async (_id, projection) =>
  getDocumentById('User', _id, projection);

export const signIn = async data => {
  const { password, username } = data;

  const user = await User.findByCredentials(username, password);
  if (!isNil(data.deviceToken)) {
    const { deviceToken } = data;
    user.deviceToken = deviceToken;
    await sendWarningNotification([deviceToken], null);
  }
  const token = await user.generateAuthToken();
  return { token, user };
};

export const signOut = async (user, token) => {
  user.tokens = user.tokens.filter(t => t !== token);
  user.deviceToken = null;
  const signedOutUser = await user.save();
  return signedOutUser;
};

export const signOutAll = async user => {
  user.tokens = [];
  const signedOutUser = await user.save();
  return signedOutUser;
};

export const createDummyUser = async (amount, role) => {
  const users = [];
  for (let i = 0; i < amount; i++) {
    const username = `Dummy${i}${role}`;
    const password = `Dummy${i}${role}`;
    const displayName = `Dummy${i}${role}`;
    const gender = 'OTHER';
    const email = `dummy${i}${role}@abc.com`;
    const phone = `0909090909${i}`;
    try {
      const createdUser = await createUser({
        displayName,
        email,
        gender,
        password,
        phone,
        role,
        username,
      });
      users.push(createdUser);
    } catch (e) {
      // console.log(e);
    }
  }
  return users;
};

export const createUser = async data => {
  const { displayName, email, gender, password, phone, role, username } = data;

  await validateUsername(username);
  await validateUsernameExists(username);
  await validatePassword(password);

  if (!isNil(email)) {
    await validateEmail(email);
    // await validateEmailExists(email);
  }

  if (!isNil(phone)) {
    await validatePhone(phone);
    // await validatePhoneExists(phone);
  }

  if (!isNil(role)) {
    await validateRole(role);
  }

  if (!isNil(displayName)) {
    await validateDisplayName(displayName);
  }

  const user = new User({
    displayName,
    email,
    gender,
    password,
    phone,
    role,
    username,
  });

  const createdUser = await user.save();
  return createdUser;
};

export const deactivateUser = async user => {
  if (user.activationToken) {
    throwError('Cannot remove a removed user!', 400, null);
  }
  const activationToken = uuidv4();
  user.activationToken = activationToken;
  await user.save();
  return user;
};

export const activateUser = async user => {
  if (!user.activationToken) {
    throwError('Cannot back up a active user!', 400, null);
  }
  user.activationToken = null;
  await user.save();
  return user;
};

export const updateUser = async (user, data) => {
  const { displayName, email, gender, phone, role, username } = data;
  if (!isNil(username)) {
    await validateUsername(username);
    await validateUsernameUpdate(user._id.toString(), username);
    user.username = username;
  }

  if (!isNil(displayName)) {
    await validateDisplayName(displayName);
    user.displayName = displayName;
  }

  if (!isNil(gender)) {
    await validateGender(gender);
    user.gender = gender;
  }

  if (!isNil(email)) {
    await validateEmail(email);
    await validateEmailUpdate(user._id.toString(), email);
    user.email = email;
  }

  if (!isNil(phone)) {
    await validatePhone(phone);
    await validatePhoneUpdate(user._id.toString(), phone);
    user.phone = phone;
  }

  if (!isNil(role)) {
    await validateRole(role);
    user.role = role;
  }

  const updatedUser = await user.save();
  return updatedUser;
};

export const updateUserExpiryDate = async user => {
  // Query all payment of user
  const payments = await Payment.find({ customer: user._id.toString() }, null, {
    sort: { createdAt: 1 },
  });
  let newExpiryDate = moment(user.createdAt);

  payments.forEach(payment => {
    newExpiryDate =
      newExpiryDate.diff(moment(payment.createdAt)) > 0
        ? newExpiryDate.add({ days: payment.paymentPlan?.period })
        : moment(payment.createdAt).add({ days: payment.paymentPlan?.period });
  });
  user.expiryDate = new Date(newExpiryDate);
  const updatedUser = await user.save();
  return updatedUser;
};

export const checkUpdaterRoleAuthorization = (updaterRole, updatedRole) => {
  if (
    userRoles.indexOf(updaterRole) < userRoles.indexOf(updatedRole) ||
    userRoles.indexOf(updatedRole) === -1
  ) {
    throwError('Unauthorized', 403);
  }
};

export const checkFacesEnough = (role, faces) => {
  if (role === 'SYSTEM_ADMIN' && faces.length !== 0) {
    throwError(`Admin don't need to register face`, 400);
  }
  if (faces.length !== 9) {
    throwError(`Not enough 9 registered face images`, 400);
  }
};

// export const updateAvatarWithURL = async (user, url) => {
//   // Validate file (not empty & is image)
//   if (!url) {
//     throwError('URL is empty', 422);
//   }

//   // Create stream from file & compress
//   const transform = sharp()
//     .resize(300, 300)
//     .toFormat('png');
//   const stream = await request.get(url).pipe(transform);

//   return uploadAvatar(user, stream);
// };

export const getAllOnlineTrainer = async () => {
  const trainers = await await User.find({
    deviceToken: { $ne: null },
    isOnline: true,
  });
  return trainers;
};

export const updateAvatarWithFileUpload = async (user, file) => {
  const { createReadStream, mimetype } = await file;
  if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
    throwError('Input file is not an image', 415);
  }

  // Create stream from file & compress
  const transform = sharp()
    .resize(300, 300)
    .toFormat('png');
  const stream = createReadStream().pipe(transform);

  return uploadAvatar(user, stream);
};

export const changeOnlineStatus = async (trainer, status) => {
  trainer.isOnline = status;
  const updatedTrainer = await trainer.save();
  return updatedTrainer;
};

export const deleteUser = async user => {
  const deletedUser = await user.remove();
  return deletedUser;
};

export const deleteUsers = async users => {
  await users.map(user => user.remove());
  return users.length;
};

export const updatePassword = async (user, data) => {
  const { newPassword, oldPassword } = data;

  await validatePassword(newPassword);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throwError('The old password is not correct', 400, null);
  }

  user.password = newPassword;

  const updatedUser = await user.save();
  return updatedUser;
};

const uploadAvatar = async (user, stream) => {
  // Delete old avatar from S3
  if (user.avatar && user.avatar.key) {
    await deleteFileS3(user.avatar.key);
    let success = false;

    // Make sure file has been already deleted
    try {
      await getFileS3(user.avatar.key);
    } catch (err) {
      if (err.statusCode === 404) {
        success = true;
      }
    }

    if (success) {
      user.avatar = null;
    } else {
      throwError('Delete old avatar failed', 500);
    }
  }

  // Upload new avatar
  const data = await uploadFileS3(
    `user/${user._id}/avatar/${Date.now()}`,
    stream,
    'image/png'
  );

  // Update parent
  user.avatar = {
    key: data.Key,
    url: data.Location,
  };
  await user.save();

  return user;
};
