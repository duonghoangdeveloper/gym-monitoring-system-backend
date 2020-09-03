import mongoose, { Schema } from 'mongoose';

import { Warning } from '../../common/models';
import { validateMacAddress, validateName } from './camera.validators';

const cameraSchema = new Schema(
  {
    macAddress: {
      required: true,
      trim: true,
      type: String,
      validate: validateMacAddress,
    },
    name: {
      default: 'New camera',
      trim: true,
      type: String,
      validate: validateName,
    },
    password: {
      required: true,
      type: String,
    },
    username: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

cameraSchema.index({ createdAt: 1 });
cameraSchema.index({ macAddress: 1 }, { unique: true });

cameraSchema.pre('remove', async function(next) {
  const camera = this;

  await Warning.updateMany({ camera: camera._id }, { camera: null });

  next();
});

export const Camera = mongoose.model('Camera', cameraSchema);
