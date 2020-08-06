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
  console.log('warning: ', warning);
  console.log('warning.createdAt: ', warning.createdAt);
  const createdAt = moment(warning.createdAt);
  console.log('createdAt: ', createdAt);
  const now = moment();
  console.log('now: ', now);

  const diff = now.diff(createdAt);
  console.log('diff: ', diff);

  const diffDuration = moment.duration(diff);
  console.log('diffDuration: ', diffDuration.seconds);

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
  console.log(warnings);
  return warnings;
  // update status of warnings to FAILED / SUCCESSED using map
};

export const createWarning = async data => {
  const { content, customerId, image } = data;

  console.log('content: ', content);
  console.log('customerId: ', customerId);
  console.log('image: ', image);

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
