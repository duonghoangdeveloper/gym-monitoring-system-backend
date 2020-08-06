import mongoose, { Schema } from 'mongoose';

// import { warningStatus } from '../../common/enums';
// import { generateSchemaEnumField } from '../../common/services';
import {
  validateCustomerRequired,
  validateImage,
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
      required: true,
      trim: true,
      type: String,
      validate: validateImage,
    },

    note: {
      trim: true,
      type: String,
    },

    status: {
      required: true,
      trim: true,
      type: String,
      // ...generateSchemaEnumField(warningStatus),
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
