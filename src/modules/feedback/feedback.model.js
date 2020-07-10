import mongoose, { Schema } from 'mongoose';

import { validateContent } from './feedback.validators';

export const feedbackSchema = new mongoose.Schema(
  {
    content: {
      trim: true,
      type: String,
      validate(content) {
        validateContent(content);
      },
    },

    customer: {
      ref: 'User',
      required: true,
      type: Schema.Types.ObjectId,
    },

    staffs: {
      default: [],
      required: true,
      type: [
        {
          ref: 'User',
          required: true,
          type: Schema.Types.ObjectId,
        },
      ],
    },

    title: {
      trim: true,
      type: String,
      validate(title) {
        validateContent(title);
      },
    },
  },
  { timestamps: true, versionKey: false }
);

feedbackSchema.index({ title: 1 });
feedbackSchema.index({ content: 1 });
feedbackSchema.index({ customer: 1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
