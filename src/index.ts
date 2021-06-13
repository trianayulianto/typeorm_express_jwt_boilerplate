import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { createConnection } from 'typeorm';
import Routes from './routes';
import errorHandler from './middleware/ErrorHandler';

// eslint-disable-next-line no-unused-vars
createConnection().then(async (_connection) => {
  dotenv.config();

  // create express app
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookieParser());

  // register express routes from defined application routes
  Routes.forEach((route) => {
    (app as any)[route.method](
      route.route,
      route.middleware,
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = (new (route.controller as any)())[route.action](req, res, next);

        if (result instanceof Promise) {
          result.then((rslt) => (rslt !== null && rslt !== undefined
            ? res.send(rslt)
            : undefined));
        } else if (result !== null && result !== undefined) {
          res.json(result);
        }
      },
    );
  });

  // setup express app here
  app.options('*', cors());
  app.use(errorHandler);

  // start express server
  app.listen(3000);

  // eslint-disable-next-line no-console
  console.log('Express server has started on port 3000.');
// eslint-disable-next-line no-console
}).catch((error) => console.log(error));
