import jwt from 'jsonwebtoken';

import User from '../modules/user/user.model';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return next();
    }

    const { _id } = decodedToken;

    if (!_id) {
      return next();
    }

    const user = await User.findById(_id);

    if (!user) {
      return next();
    }

    if (!user.tokens.some(t => t === token)) {
      return next();
    }

    req.user = user;
    req.token = token;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default auth;
