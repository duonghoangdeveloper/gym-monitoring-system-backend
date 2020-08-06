import mongoose, { Schema } from 'mongoose';

import {
  validateCreatorRequired,
  validateCustomerRequired,
} from './payment.validators';

const paymentSchema = new mongoose.Schema(
  {
    creator: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateCreatorRequired,
    },
    customer: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateCustomerRequired,
    },
    package: {
      ref: 'Package',
      required: true,
      type: {
        name: {
          required: true,
          trim: true,
          type: String,
        },
        period: {
          required: true,
          trim: true,
          type: Number,
        },
        price: {
          required: true,
          trim: true,
          type: Number,
        },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

paymentSchema.index({ customer: 1 });
paymentSchema.index({ creator: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
