import mongoose, { Schema } from 'mongoose';

import { getUserById } from '../user/user.services';
// expiredDate
import {
  validateCreatorRequired,
  validateCustomerRequired,
} from './payment.validators';

const paymentSchema = new Schema(
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

paymentSchema.index({ createdAt: 1 }, { unique: true });
paymentSchema.index({ customer: 1 }, { unique: true });
paymentSchema.index({ creator: 1 }, { unique: true });

// Hash the plain text password before saving
// paymentSchema.pre('save', async function(next) {
//   const payment = this;
//   const userId = payment.customer;
//   const customerToRefresh = getUserById(userId);
//   await refreshExpiredDate(customerToRefresh);
//   next();
// });
export const Payment = mongoose.model('Payment', paymentSchema);
