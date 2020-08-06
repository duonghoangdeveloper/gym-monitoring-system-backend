import mongoose, { Schema } from 'mongoose';

import {
  validateName,
  validatePeriod,
  validatePrice,
} from './package.validators';

const packageSchema = new Schema(
  {
    name: {
      required: true,
      trim: true,
      type: String,
      validate: validateName,
    },
    period: {
      required: true,
      trim: true,
      type: Number,
      validate: validatePeriod,
    },
    price: {
      required: true,
      trim: true,
      type: Number,
      validate: validatePrice,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

packageSchema.index({ createdAt: 1 });
packageSchema.index({ name: 1 }, { unique: true });
packageSchema.index({ price: 1 });
packageSchema.index({ period: 1 });

export const Package = mongoose.model('Package', packageSchema);
