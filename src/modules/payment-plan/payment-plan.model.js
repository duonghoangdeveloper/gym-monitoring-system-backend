import mongoose, { Schema } from 'mongoose';

import {
  validateName,
  validatePeriod,
  validatePrice,
} from './payment-plan.validators';

const paymentPlanSchema = new Schema(
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

paymentPlanSchema.index({ createdAt: 1 });
paymentPlanSchema.index({ name: 1 }, { unique: true });
paymentPlanSchema.index({ price: 1 });
paymentPlanSchema.index({ period: 1 });

export const PaymentPlan = mongoose.model('PaymentPlan', paymentPlanSchema);
