import { createFeedback } from '../../../src/modules/feedback/feedback.services';
import { users } from '../user/user.seed';

export const feedbacks = [
  {
    document: null,
    input: {
      content: 'Content of feedback 1',
      title: 'Feedback 1',
    },
  },
  {
    document: null,
    input: {
      content: 'Content of feedback 2',
      title: 'Feedback 2',
    },
  },
  {
    document: null,
    input: {
      content: 'Content of feedback 3',
      title: 'Feedback 3',
    },
  },
];

export const seedFeedbacks = async () => {
  await Promise.all(
    feedbacks.map(async feedback => {
      const document = await createFeedback(users[4].document, {
        ...feedback.input,
      });
      feedback.document = document;
    })
  );
};
