import mongoose, { Schema } from 'mongoose';

import { url } from '../../common/fields';
import { validateUserRequired } from './face.validators';

const faceSchema = new Schema(
  {
    key: {
      required: true,
      type: String,
    },
    url: {
      ...url,
      required: true,
    },
    user: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
      validate: validateUserRequired,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

faceSchema.index({ createdAt: 1 });
faceSchema.index({ user: 1 });

export const Face = mongoose.model('Face', faceSchema);
