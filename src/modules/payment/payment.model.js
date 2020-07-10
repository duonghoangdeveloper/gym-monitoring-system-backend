import mongoose, { Schema } from 'mongoose';

import { packageSchema } from '../package/package.model';
import {
  validateExistCreator,
  validateExistCustomer,
  validateExistPackage,
} from './payment.validators';

export const paymentSchema = new mongoose.Schema(
  {
    creator: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateExistCreator,
    },
    customer: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateExistCustomer,
    },
    isActive: {
      type: Boolean,
    },
    package: {
      ref: 'Package',
      required: true,
      type: {
        name: {
          trim: true,
          type: String,
        },
        period: {
          trim: true,
          type: Number,
        },
        price: {
          trim: true,
          type: Number,
        },
      },
      validate: validateExistPackage,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ customer: 1 }, { unique: true });
paymentSchema.index({ manager: 1 }, { unique: true });

export const Payment = mongoose.model('Payment', paymentSchema);
