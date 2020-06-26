import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
} from '../../common/services';
import {
  createUser,
  signIn,
  signOut,
  signUp,
  updateUser,
} from './user.services';

export const Mutation = {
  async createUser(_, { data }) {
    console.log(data);
    const { user, token } = await createUser(data);
    return generateAuthPayload({ document: user, token });
  },
  async signIn(_, { data }) {
    const { user, token } = await signIn(data);
    return generateAuthPayload({ document: user, token });
  },
  async signOut(_, __, { req }) {
    const user = await signOut(req.user, req.token);
    return generateDocumentPayload(user);
  },
  async signUp(_, { data }) {
    const { user, token } = await signUp(data);
    return generateAuthPayload({ document: user, token });
  },
  async updateProfile(_, { data }, { req }) {
    const user = checkRole(req.user);
    const updatedProfile = await updateUser(user, data);
    return generateDocumentPayload(updatedProfile);
  },
};

export const Query = {
  async auth(_, __, { req }) {
    const user = checkRole(req.user, ['GYM_OWNER', 'TRAINEE']);
    return generateDocumentPayload(user);
  },
  // async gender(_, __, { req }) {
  //   const gender = checkGender(req.user, ['GYM_OWNER', 'TRAINEE']);
  //   return generateDocumentPayload(user);
  // },
};

export const User = {
  // async feedbacks() {},
};
