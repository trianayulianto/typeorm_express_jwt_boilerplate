import UserController from '../controller/UserController';
import authenticate from '../middleware/Authenticate';
import authorize from '../middleware/Authorize';
import { createUserSchema, updateUserSchema } from '../middleware/schema/UserSchema';

const Users = [
  {
    method: 'get',
    route: '/users',
    controller: UserController,
    action: 'all',
    middleware: [
      authenticate,
    ],
  },
  {
    method: 'get',
    route: '/users/:id',
    controller: UserController,
    action: 'one',
    middleware: [
      authenticate,
    ],
  },
  {
    method: 'post',
    route: '/users',
    controller: UserController,
    action: 'save',
    middleware: [
      authenticate,
      authorize([0]),
      createUserSchema,
    ],
  },
  {
    method: 'put',
    route: '/users/:id',
    controller: UserController,
    action: 'update',
    middleware: [
      authenticate,
      authorize([0]),
      updateUserSchema,
    ],
  },
  {
    method: 'delete',
    route: '/users/:id',
    controller: UserController,
    action: 'remove',
    middleware: [
      authenticate,
      authorize([0]),
    ],
  },
];

export default Users;
