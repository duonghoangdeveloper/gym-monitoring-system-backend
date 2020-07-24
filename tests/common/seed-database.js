import * as models from '../../src/common/models';
import { seedFeedbacks } from '../modules/feedback/feedback.seed';
import { seedPackages } from '../modules/package/package.seed';
import { seedUsers } from '../modules/user/user.seed';

export const seedDatabase = async () => {
  await Promise.all(Object.values(models).map(model => model.deleteMany({})));
  await seedUsers();
  await seedFeedbacks();
  await seedPackages();
};
