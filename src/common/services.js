import { isNil } from 'lodash';

import { userRoles } from './enums';
import * as models from './models';
import { validatorMapping } from './validators';

export const throwError = (message, statusCode = 500, data) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  throw error;
};

export const checkRole = (user, roles = userRoles) => {
  if (!roles.every(role => userRoles.indexOf(role) >= 0)) {
    throwError('Role check list is invalid', 500);
  }

  if (!user) {
    throwError('Unauthorized', 401);
  }

  if (!roles.includes(user.role)) {
    throwError('Unauthenticated', 401);
  }

  return user;
};

// 3 functions below for quering many documents
const generateMongooseFilter = filter => {
  const mongooseFilter = {};

  if (typeof filter === 'object' && filter !== null) {
    Object.keys(filter).forEach(key => {
      if (Array.isArray(filter[key]) && filter[key].length > 0) {
        if (filter[key].length === 1) {
          mongooseFilter[key] = filter[key];
        } else {
          mongooseFilter[key] = { $in: filter[key] };
        }
      }
    });
  }

  return mongooseFilter;
};
const generateMongooseSearch = search => {
  if (typeof search === 'object' && search !== null) {
    const $or = Object.keys(search)
      .filter(key => typeof search[key] === 'string' && search[key].length > 0)
      .map(key => ({
        [key]: {
          $options: 'i',
          $regex: search[key],
        },
      }));

    if ($or.length > 0) {
      return {
        $or,
      };
    }
  }

  return {};
};
const generateActivationQuery = isActive =>
  isNil(isActive)
    ? {}
    : isActive
    ? {
        activationToken: null,
      }
    : {
        activationToken: { $ne: null },
      };
export const mongooseQuery = async (modelName, query, initialFind) => {
  if (!models[modelName]) {
    throwError('Invalid model name', 500);
  }

  const { filter, isActive, limit, search, skip, sort } = query || {};

  const sortArgs = sort || '-createdAt';
  const skipNumber = parseInt(skip, 10) || 0;
  const limitNumber = parseInt(limit, 10) || 100;

  const findFilter = {
    ...initialFind,
    ...generateMongooseFilter(filter),
    ...generateMongooseSearch(search),
    ...generateActivationQuery(isActive),
  };

  const [documents, total] = await Promise.all([
    models[modelName]
      .find(findFilter)
      .sort(sortArgs)
      .skip(skipNumber)
      .limit(limitNumber),
    models[modelName].countDocuments(findFilter),
  ]);

  return { documents, total };
};

// To count all document in a collection
export const countDocuments = async modelName => {
  if (!models[modelName]) {
    throwError('Invalid model name', 500);
  }

  const documentsCount = await models[modelName].estimatedDocumentCount();
  return documentsCount;
};

export const getDocumentById = async (modelName, _id, projection) => {
  if (!models[modelName]) {
    throwError('Invalid model name', 500);
  }

  const document = await models[modelName].findById(_id, projection);

  if (!document) {
    throwError(`${modelName} not found`, 404);
  }

  return document;
};

// Generate payload for 1 document to send to client, using in resolvers
export const generateDocumentPayload = document => {
  const doc = {};

  Object.keys(document._doc).forEach(
    key =>
      (doc[key] =
        document._doc[key] instanceof Date
          ? document._doc[key].toISOString()
          : document._doc[key])
  );

  return {
    ...doc,
    _id: document._id ? document._id.toString() : null,
    createdAt: document.createdAt && document.createdAt.toISOString(),
    updatedAt: document.updatedAt && document.updatedAt.toISOString(),
  };
};

// Generate payload for many documents to send to client, using in resolvers
export const generateDocumentsPayload = ({ documents, total }) => ({
  data: documents.map(generateDocumentPayload),
  total,
});

// Generate auth payload to send to client, using in graphql user resolvers
export const generateAuthPayload = ({ document, token }) => ({
  data: generateDocumentPayload(document),
  token,
});

export const checkBelongingness = async (document, userId, field = 'user') => {
  if (document[field].toString() !== userId) {
    throwError('Not belong to this user', 403);
  }
};

export const generateSchemaArrayField = (
  fieldName,
  minLength = 0,
  maxLength = 10
) => ({
  default: [],
  required: true,
  validate: {
    message: `Length of ${fieldName} array is invalid`,
    validator: array => array.length >= minLength && array.length <= maxLength,
  },
});

export const generateSchemaEnumField = _enum => ({
  default: _enum[0],
  enum: _enum,
  required: true,
  type: String,
});

export const validateField = async (model, field, value) => {
  if (!models[model]) {
    throwError('Invalid model name', 500);
  }

  const validators = validatorMapping[model]?.[field] ?? [];
  const errors = (
    await Promise.all(
      validators.map(async validator => {
        try {
          await validator(value);
        } catch (e) {
          return e.message;
        }
        return null;
      })
    )
  ).filter(message => message !== null);

  return errors;
};

export const validateObjectId = id => id.match(/^[0-9a-fA-F]{24}$/);
