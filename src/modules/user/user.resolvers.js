import {
  checkRole,
  generateAuthPayload,
  generateDocumentPayload,
  generateDocumentsPayload,
} from '../../common/services';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  signIn,
  signOut,
  signUp,
  updatePassword,
  updateUser,
} from './user.services';

export const Mutation = {
  async createUser(_, { data }, { req }) {
    console.log(data);
    checkRole(req.user);
    const createdUser = await createUser(data);
    return generateDocumentPayload(createdUser);
  },
  async deleteUser(_, { _id }, { req }) {
    checkRole(req.user);
    const userToDelete = await getUserById(_id);
    const deletedUser = await deleteUser(userToDelete);
    return generateDocumentPayload(deletedUser);
  },
  async signIn(_, { data }) {
    const { user, token } = await signIn(data);
    return generateAuthPayload({ document: user, token });
  },
  async signOut(_, __, { req }) {
    const user = await signOut(req.user, req.token);
    return generateDocumentPayload(user);
  },
  // async signUp(_, { data }) {
  //   const { user, token } = await signUp(data);
  //   return generateAuthPayload({ document: user, token });
  // },
  async updatePassword(_, { data }, { req }) {
    const user = checkRole(req.user);
    const updatePassword = await updatePassword(user, data);
    return generateDocumentPayload(updatePassword);
  },
  async updateProfile(_, { data }, { req }) {
    const user = checkRole(req.user);
    if(!data._id){
      const updatedProfile = await updateUser(user, data);
      return generateDocumentPayload(updatedProfile);
    }else{
      const updatedProfile = await updateUser(user, data._id, data);
      return generateDocumentPayload(updatedProfile);
    }
  },
};

export const Query = {
  async auth(_, __, { req }) {
    const user = checkRole(req.user, ['GYM_OWNER', 'TRAINEE']);
    return generateDocumentPayload(user);
  },
  async users(_, { query }, { req }) {
    checkRole(req.user);
    const users = await getUsers(query);
    return generateDocumentsPayload(users);
  },
};

export const User = {
  // async feedbacks() {},
};
