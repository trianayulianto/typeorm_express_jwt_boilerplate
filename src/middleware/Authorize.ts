import { getRepository } from 'typeorm';
import User from '../entity/User';
import RefreshToken from '../entity/RefreshToken';

const authorize = (roles = []) => {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === 'string') {
    // eslint-disable-next-line no-param-reassign
    roles = [roles];
  }

  // authorize based on user role
  return async (req, res, next) => {
    const user = await getRepository(User).findOne(req.user.id);

    if (!user || (roles.length && !roles.includes(user.role))) {
      // account no longer exists or role not authorized
      res.status(401).send({
        status: 'fail',
        message: 'Unauthorized',
      });

      return;
    }

    // authentication and authorization successful
    const refreshTokens = await getRepository(RefreshToken).find({ user });

    req.user.ownsToken = (token) => !!refreshTokens.find((x) => x.token === token);

    next();
  };
};

export default authorize;
