import mongoose from 'mongoose';

import {
  validateName,
  validatePeriod,
  validatePrice,
} from './package.validators';

const packageSchema = new mongoose.Schema(
  {
    name: {
      trim: true,
      type: String,
      validate: validateName,
    },
    period: {
      trim: true,
      type: Number,
      validate: validatePeriod,
    },
    price: {
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

packageSchema.index({ name: 1 }, { unique: true });
packageSchema.index({ price: 1 });
packageSchema.index({ period: 1 });

export const Package = mongoose.model('Package', packageSchema);
