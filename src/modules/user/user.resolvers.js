import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
} from '../../common/services';
import { signIn, signUp } from './user.services';

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

export const Query = {
  async auth(_, __, { req }) {
    const user = checkRole(req.user, ['GYM_OWNER', 'TRAINEE']);
    return generateDocumentPayload(user);
  },
};

export const User = {};
