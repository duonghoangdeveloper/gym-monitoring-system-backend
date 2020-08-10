import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';

import { userGenders, userRoles } from '../../common/enums';
import { url } from '../../common/fields';
import { generateSchemaEnumField } from '../../common/services';
import {
  validateDisplayName,
  validateEmail,
  validatePhone,
  validateUsername,
} from './user.validators';

const userSchema = new Schema(
  {
    activationToken: {
      type: String,
    },
    avatar: {
      _id: false,
      key: {
        type: String,
      },
      timestamps: false,
      url: {
        ...url,
      },
    },

    displayName: {
      default: 'New user',
      trim: true,
      type: String,
      validate: validateDisplayName,
    },

    email: {
      trim: true,
      type: String,
      validate: validateEmail,
    },

    expiryDate: {
      default: new Date(),
      trim: true,
      type: Date,
    },

    gender: {
      ...generateSchemaEnumField(userGenders),
    },

    isOnline: {
      default: false,
      type: Boolean,
    },

    password: {
      required: true,
      trim: true,
      type: String,
    },

    phone: {
      trim: true,
      type: String,
      validate: validatePhone,
    },

    role: {
      ...generateSchemaEnumField(userRoles),
    },

    tokens: {
      default: [],
      required: true,
      type: [
        {
          required: true,
          type: String,
        },
      ],
    },

    username: {
      required: true,
      trim: true,
      type: String,
      validate: validateUsername,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ activationToken: 1, createdAt: 1 }, { unique: true });
userSchema.index({ activationToken: 1, username: 1 }, { unique: true });
userSchema.index(
  { activationToken: 1, email: 1 },
  { sparse: true, unique: true }
);
userSchema.index(
  { activationToken: 1, phone: 1 },
  { sparse: true, unique: true }
);
userSchema.index({ activationToken: 1, role: 1 });

// Gene

// Sign in
userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });

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
          ? '1 day'
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

export const User = mongoose.model('User', userSchema);
