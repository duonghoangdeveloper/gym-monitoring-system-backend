import { generateAuthPayload } from '../../common/services';
import { signIn, signUp } from './user.services';

export const User = {};

export const Query = {};

export const Mutation = {
  async signIn(_, { data }) {
    const { user, token } = await signIn(data);
    return generateAuthPayload({ document: user, token });
  },
  async signUp(_, { data }) {
    const { user, token } = await signUp(data);
    return generateAuthPayload({ document: user, token });
  },
};
