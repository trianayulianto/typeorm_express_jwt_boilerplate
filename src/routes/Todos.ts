import TodoController from '../controller/TodoController';
import todoSchema from '../middleware/schema/TodoSchema';
import authenticate from '../middleware/Authenticate';
import mustVerified from '../middleware/MustVerified';

const Todos = [
  {
    method: 'get',
    route: '/todos',
    controller: TodoController,
    action: 'all',
    middleware: [
      authenticate,
      mustVerified,
    ],
  },
  {
    method: 'get',
    route: '/todos/:id',
    controller: TodoController,
    action: 'one',
    middleware: [
      authenticate,
      mustVerified,
    ],
  },
  {
    method: 'post',
    route: '/todos',
    controller: TodoController,
    action: 'save',
    middleware: [
      authenticate,
      mustVerified,
      todoSchema,
    ],
  },
  {
    method: 'put',
    route: '/todos/:id',
    controller: TodoController,
    action: 'update',
    middleware: [
      authenticate,
      mustVerified,
      todoSchema,
    ],
  },
  {
    method: 'delete',
    route: '/todos/:id',
    controller: TodoController,
    action: 'remove',
    middleware: [
      authenticate,
      mustVerified,
    ],
  },
];

export default Todos;
