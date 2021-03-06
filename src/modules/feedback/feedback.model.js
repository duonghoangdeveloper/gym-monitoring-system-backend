import mongoose, { Schema } from 'mongoose';

import { validateContent } from './feedback.validators';

const feedbackSchema = new mongoose.Schema(
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

    staffIds: {
      default: [],
      type: [
        {
          ref: 'User',
          required: true,
          type: Schema.Types.ObjectId,
        },
      ],
    },

    //   title: {
    //     trim: true,
    //     type: String,
    //     validate(title) {
    //       validateContent(title);
    //     },
    //   },
  },
  { timestamps: true, versionKey: false }
);

feedbackSchema.index({ createdAt: 1 });
feedbackSchema.index({ title: 1 });
feedbackSchema.index({ content: 1 });
feedbackSchema.index({ customer: 1 });
feedbackSchema.index({ createdAt: 1 });
export const Feedback = mongoose.model('Feedback', feedbackSchema);
