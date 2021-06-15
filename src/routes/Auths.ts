import AuthController from '../controller/AuthController';
import authenticate from '../middleware/Authenticate';
import authorize from '../middleware/Authorize';
import {
  registerSchema, authenticateSchema, revokeTokenSchema,
  verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../middleware/schema/AuthSchema';

const Auths = [
  {
    method: 'get',
    route: 'me',
    controller: AuthController,
    action: 'getUserProfile',
    middleware: [
      authenticate,
    ],
  },
  {
    method: 'post',
    route: 'login',
    controller: AuthController,
    action: 'authenticate',
    middleware: [
      authenticateSchema,
    ],
  },
  {
    method: 'post',
    route: 'refresh-token',
    controller: AuthController,
    action: 'refreshToken',
    middleware: [],
  },
  {
    method: 'post',
    route: 'revoke-token',
    controller: AuthController,
    action: 'revokeToken',
    middleware: [
      authenticate,
      authorize([0, 1]),
      revokeTokenSchema,
    ],
  },
  {
    method: 'post',
    route: 'signup',
    controller: AuthController,
    action: 'register',
    middleware: [
      registerSchema,
    ],
  },
  {
    method: 'post',
    route: 'verify-email',
    controller: AuthController,
    action: 'verifyEmail',
    middleware: [
      verifyEmailSchema,
    ],
  },
  {
    method: 'post',
    route: 'forgot-password',
    controller: AuthController,
    action: 'forgotPassword',
    middleware: [
      forgotPasswordSchema,
    ],
  },
  {
    method: 'post',
    route: 'reset-password',
    controller: AuthController,
    action: 'resetPassword',
    middleware: [
      resetPasswordSchema,
    ],
  },
];

Auths.forEach((auth, index) => {
  Auths[index].route = `/account/${auth.route}`;
});

export default Auths;
