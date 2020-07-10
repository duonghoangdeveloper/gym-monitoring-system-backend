import mongoose, { Schema } from 'mongoose';

import {
  validateCreatorExists,
  validateCustomerExists,
  validatePackageExists,
} from './payment.validators';

const paymentSchema = new mongoose.Schema(
  {
    creator: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateCreatorExists,
    },
    customer: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateCustomerExists,
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
      validate: validatePackageExists,
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
