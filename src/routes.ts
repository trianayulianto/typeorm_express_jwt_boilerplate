import Auths from './routes/Auths';
import Users from './routes/Users';
import Todos from './routes/Todos';

const Routes = [
  ...Auths,
  ...Users,
  ...Todos,
];

export default Routes;
