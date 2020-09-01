import mongoose, { Schema } from 'mongoose';

import { validateName } from './dangerous-posture-type.validators';

const dangerousPostureTypeSchema = new Schema(
  {
    description: {
      required: true,
      trim: true,
      type: String,
    },
    title: {
      required: true,
      trim: true,
      type: String,
      validate: validateName,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

dangerousPostureTypeSchema.index({ createdAt: 1 });
dangerousPostureTypeSchema.index({ title: 1 }, { unique: true });

export const DangerousPostureType = mongoose.model(
  'DangerousPostureType',
  dangerousPostureTypeSchema
);
