import mongoose, { Schema } from 'mongoose';

import { validateName } from './dangerous-posture.validators';

const dangerousPostureSchema = new Schema(
  {
    dangerousPostureType: {
      ref: 'DangerousPostureType',
      required: true,
      type: Schema.Types.ObjectId,
    },

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

dangerousPostureSchema.index({ createdAt: 1 });

dangerousPostureSchema.index({ title: 1 }, { unique: true });

export const DangerousPosture = mongoose.model(
  'DangerousPosture',
  dangerousPostureSchema
);
