import { userRoles } from './enums';
import * as models from './models';

export const throwError = (message, statusCode = 500, data) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  throw error;
};

export const checkRole = (user, roles = userRoles) => {
  if (!user) {
    throwError('Unauthorized', 401);
  }

  if (!roles.includes(user.role)) {
    throwError('Unauthorized', 401);
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
export const mongooseQuery = async (modelName, query, initialQuery) => {
  if (!models[modelName]) {
    throwError('Invalid model name', 500);
  }

  const {
    skip: initialSkip,
    limit: initialLimit,
    search: initialSearch,
    sort: initialSort,
    filter: initialFilter,
    find: initialFind,
  } = initialQuery || {};
  const { skip, limit, search, sort, filter } = query || {};

  const sortArgs = { ...initialSort, ...sort, createdAt: -1 } || {
    createdAt: -1,
  };
  const skipNumber = parseInt(skip, 10) || parseInt(initialSkip, 10) || 0;
  const limitNumber = parseInt(limit, 10) || parseInt(initialLimit, 10) || 100;

  const findFilter = {
    ...initialFind,
    ...generateMongooseFilter(initialFilter),
    ...generateMongooseSearch(initialSearch),
    ...generateMongooseFilter(filter),
    ...generateMongooseSearch(search),
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

export const checkBelongingness = async (document, userId) => {
  if (document.user.toString() !== userId) {
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
