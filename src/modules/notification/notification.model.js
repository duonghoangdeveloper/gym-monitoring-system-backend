import mongoose, { Schema } from 'mongoose';

import { url } from '../../common/fields';
// import { notificationStatuses } from '../../common/enums';
// import { generateSchemaEnumField } from '../../common/services';
import { validateUserRequired } from './notification.validators';

const notificationSchema = new mongoose.Schema(
  {
    content: {
      trim: true,
      type: String,
    },

    status: {
      required: true,
      trim: true,
      type: String,
      // ...generateSchemaEnumField(notificationStatuses),
    },

    user: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      validate: validateUserRequired,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ createdAt: -1, user: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
