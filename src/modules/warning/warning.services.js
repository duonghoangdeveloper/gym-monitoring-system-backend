import isNil from 'lodash.isnil';
import moment from 'moment';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { Warning } from './warning.model';
import {
  validateCustomerRequired,
  validateImage,
  // validateStatus,
  validateSupporterRequired,
} from './warning.validators';
// refreshWarningStatus
const updateStatusByTime = async warning => {
  const createdAt = moment(warning.createdAt);
  const now = moment();

  const diff = now.diff(createdAt);

  const diffDuration = moment.duration(diff);

  // console.log('warning: ', warning);
  // console.log('warning.createdAt: ', warning.createdAt);
  // console.log('createdAt: ', createdAt);
  // console.log('now: ', now);
  // console.log('diff: ', diff);
  // console.log('diffDuration: ', diffDuration.seconds);

  if (diffDuration.minutes() > 5) {
    warning.status = 'FAILED';
    await warning.save();
    const updatedWarning = await warning.save();
    return updatedWarning;
  }
  return warning;
};

export const getWarningById = async (_id, projection) => {
  const warning = getDocumentById('Warning', _id, projection);
  return updateStatusByTime(warning);
};
// update status of warning to FAILED / SUCCESSED

export const getWarnings = async (query, initialFind) => {
  const warnings = mongooseQuery('Warning', query, initialFind);
  return warnings;
  // update status of warnings to FAILED / SUCCESSED using map
};

export const createWarning = async data => {
  const { content, customerId, image } = data;

  if (!isNil(customerId)) {
    validateCustomerRequired(customerId);
  }
  validateImage(image);

  const warning = new Warning({
    content,
    customer: customerId,
    image,
    status: 'PENDING',
  });

  const createdWarning = await warning.save();
  return createdWarning;
};

export const updateWarning = async (warning, data, supporter) => {
  const { content, customerId, note } = data;
  const supporterId = supporter._id;

  if (!isNil(customerId)) {
    await validateCustomerRequired(customerId);
    warning.customer = customerId;
  }
  if (!isNil(supporterId)) {
    await validateSupporterRequired(supporterId);
    warning.supporter = supporterId;
  }
  if (!isNil(content)) {
    warning.content = content;
  }
  if (!isNil(note)) {
    warning.note = note;
  }
  warning.status = 'SUCCEEDED';

  const updatedWarning = await warning.save();
  return updatedWarning;
};

export const deleteWarning = async warning => {
  const deletedWarning = await warning.remove();
  return deletedWarning;
};
