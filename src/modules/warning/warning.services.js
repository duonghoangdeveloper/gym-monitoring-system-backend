import isNil from 'lodash.isnil';
import moment from 'moment';

import { getDocumentById, mongooseQuery } from '../../common/services';
import { Warning } from './warning.model';
import {
  validateCustomerRequired,
  validateSupporterRequired,
} from './warning.validators';

const refreshStatus = async warning => {
  const now = moment();
  const createdAt = moment(warning.createdAt);
  const diff = now.diff(createdAt);
  const diffDuration = moment.duration(diff);

  if (diffDuration.minutes() > 1 && warning.status === 'PENDING') {
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

  const warning = new Warning({
    content,
    customer: customerId,
    image: {
      url:
        'https://i.pinimg.com/originals/df/a6/e6/dfa6e62d42775848a01048ed114f23b0.jpg',
    },
    status: 'PENDING',
  });

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
  console.log(warning);

  const updatedWarning = await warning.save();
  return updatedWarning;
};

export const deleteWarning = async warning => {
  const deletedWarning = await warning.remove();
  return deletedWarning;
};

export const sendWarningNotification = async () => {
  // get all warning.status==='PENDING'
  const warnings = await Warning.find({ status: 'PENDING' }, null, {
    sort: { createdAt: 1 },
  });
  // send to a notify server
};

// setInterval(() => {
//   sendWarningNotification();
// }, 20000);
