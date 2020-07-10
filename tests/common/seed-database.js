import * as models from '../../src/common/models';
import { seedUsers } from '../modules/user/user.seed';

export const seedDatabase = async () => {
  await Promise.all(Object.values(models).map(model => model.deleteMany({})));
  await seedUsers();
};
