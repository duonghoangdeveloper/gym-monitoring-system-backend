import mongoose, { Schema } from 'mongoose';

import { url } from '../../common/fields';
// import { warningStatuses } from '../../common/enums';
// import { generateSchemaEnumField } from '../../common/services';
import {
  validateCustomerRequired,
  validateSupporterRequired,
} from './warning.validators';

const warningSchema = new mongoose.Schema(
  {
    content: {
      trim: true,
      type: String,
    },

    customer: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      validate: validateCustomerRequired,
    },

    image: {
      _id: false,
      key: {
        type: String,
      },
      timestamps: false,
      url: {
        ...url,
      },
    },

    status: {
      required: true,
      trim: true,
      type: String,
      // ...generateSchemaEnumField(warningStatuses),
    },

    supporter: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      validate: validateSupporterRequired,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

warningSchema.index({ customer: 1 });
warningSchema.index({ trainer: 1 });

export const Warning = mongoose.model('Warning', warningSchema);
