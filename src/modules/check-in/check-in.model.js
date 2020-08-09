import mongoose, { Schema } from 'mongoose';

import { url } from '../../common/fields';
import { validateUserRequired } from './check-in.validators';

const checkInSchema = new Schema(
  {
    image: {
      key: {
        required: true,
        type: String,
      },
      url: {
        ...url,
        required: true,
      },
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

checkInSchema.index({ createdAt: 1 });
checkInSchema.index({ user: 1 });

export const CheckIn = mongoose.model('CheckIn', checkInSchema);
