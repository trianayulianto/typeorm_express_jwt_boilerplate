import TodoController from '../controller/TodoController';
import todoSchema from '../middleware/schema/TodoSchema';
import authenticate from '../middleware/Authenticate';
import authorize from '../middleware/Authorize';

const Todos = [
  {
    method: 'get',
    route: '/todos',
    controller: TodoController,
    action: 'all',
    middleware: [
      authenticate,
      authorize([0, 1]),
    ],
  },
  {
    method: 'get',
    route: '/todos/:id',
    controller: TodoController,
    action: 'one',
    middleware: [],
  },
  {
    method: 'post',
    route: '/todos',
    controller: TodoController,
    action: 'save',
    middleware: [
      todoSchema,
    ],
  },
  {
    method: 'put',
    route: '/todos/:id',
    controller: TodoController,
    action: 'update',
    middleware: [
      todoSchema,
    ],
  },
  {
    method: 'delete',
    route: '/todos/:id',
    controller: TodoController,
    action: 'remove',
    middleware: [],
  },
];

export default Todos;
