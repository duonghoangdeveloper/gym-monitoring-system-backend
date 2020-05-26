import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import * as enums from '../../utils/enums';
import { email, url } from '../../utils/modelFields';
import {
  generateSchemaStringField,
  generateSchemaEnumField,
} from '../../utils/modelMethods';

const userSchema = new mongoose.Schema(
  {
    // Keys
    email: {
      ...email,
    },

    // Authorization
    password: {
      ...generateSchemaStringField('password', 3, 60),
      required: true,
    },
    role: {
      ...generateSchemaEnumField(enums.userRoles),
    },
    tokens: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      required: true,
      default: [],
    },

    // Personal info
    displayName: {
      ...generateSchemaStringField('displayName', 3, 60),
      required: true,
    },
    avatar: {
      url: {
        ...url,
      },
      key: {
        type: String,
      },
      _id: false,
      timestamps: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Delete some private fields before sending to client
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// Sign in
userSchema.statics.findByCredentials = async (_email, password) => {
  const user = await User.findOne({ email: _email });

  if (!user) {
    throw new Error('Sign in failed');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Sign in failed');
  }

  return user;
};

// Generate when sign in succeeded
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const newToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test'
          ? '30 minutes'
          : '7 days',
    }
  );
  const newTokens = [
    ...user.tokens.filter(_token => {
      try {
        const decodedToken = jwt.verify(_token, process.env.JWT_SECRET);
        return !!decodedToken;
      } catch (_) {
        return false;
      }
    }),
    newToken,
  ];

  user.tokens = newTokens;
  await user.save();
  return newToken;
};

// Hash the plain text password before saving
userSchema.pre('save', async function(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);
export default User;
