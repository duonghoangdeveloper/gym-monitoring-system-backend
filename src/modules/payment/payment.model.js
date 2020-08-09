import mongoose, { Schema } from 'mongoose';

import { getPaymentPlanById } from '../payment-plan/payment-plan.services';
import { getUserById, updateUserEpiryDate } from '../user/user.services';
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
    paymentPlan: {
      ref: 'PaymentPlan',
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

// paymentSchema.post('save', recaculateEpiryDate);
// paymentSchema.post('remove', recaculateEpiryDate);
paymentSchema.post('save', async function(next) {
  const payment = this;
  const customerId = payment.customer.toString();
  const customer = await getUserById(customerId);
  await updateUserEpiryDate(customer);
  // next();
});

// const recaculateEpiryDate = function(next) {
//   console.log(123);
// };

// const recaculateEpiryDate = async function(next) {
//   const payment = this;
//   const customerId = payment.customer.toString();
//   const customer = await getUserById(customerId);
//   await updateUserEpiryDate(customer);
//   next();
// };

export const Payment = mongoose.model('Payment', paymentSchema);
