## Awesome Project Build with TypeORM

Make an users athentification faster


### Installation

Steps to run this project:

1. Run `npm install` command
```bash
$ npm install

```
2. Setup database settings inside `ormconfig.json` file
```typescript
{
   "type": "mysql",
   "host": "localhost",
   "port": 3306,
   "username": "your_username",
   "password": "your_password",
   "database": "db_name",
   "synchronize": true, // make sure change to false for production
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}

```

3. Copy `.env.example` to `.env`
4. Setup environment in `.env`
```environment
NODE_ENV=development

# jwt's secret token
TOKEN_SECRET=your_secret # or use this command to make it `require('crypto').randomBytes(40).toString('hex')`

# Auth's email must verified
EMAIL_MUST_VERIFIED=true # if you want to use email verification future

# nodemailer config
MAIL_HOST=smtp.mailtrap.io
MAIL_PROT=2525
MAIL_USER=your_username
MAIL_PASS=your_password
MAIL_FROM=info@domain.com
```

5. Run `npm run start` command
```bash
$ npm run dev
```
or
```bash
$ npm run start
```

### Middleware
Protect your router via middleware
  - Authenticate
  User must logged in
  ```typescript
  import authenticate from '../middleware/Authenticate';

  export const Users = [
    {
      method: 'get',
      route: '/users',
      controller: UserController,
      action: 'all',
      middleware: [
        authenticate,
      ],
    }
  ]
  ```
  - Authorize
  User must logged in and have right role
  ```typescript
  import authenticate from '../middleware/Authenticate';
  import authorize from '../middleware/Authorize';

  export const Users = [
    {
      method: 'get',
      route: '/users',
      controller: UserController,
      action: 'all',
      middleware: [
        authenticate, // make sure add this bifore authorize middleware
        authorize([0]), // 0 for root/admin, you can use more then one role `[0, 1]`
      ],
    }
  ]
  ```
  - Email Must Verified
  User must logged in and users email must verified
  ```typescript
  import authenticate from '../middleware/Authenticate';
  import mustVerified from '../middleware/MustVerified';

  export const Users = [
    {
      method: 'get',
      route: '/users',
      controller: UserController,
      action: 'all',
      middleware: [
        authenticate, // make sure add this bifore mustVerified middleware
        mustVerified,
      ],
    }
  ]
  ```

### Validation Shcema
For request Validation we user `Joi`. You can make your own validation shcema in `src/middleware/shcema` directory
for example
```typescript
import * as Joi from 'joi';
import validateRequest from '../ValidateRequest';

export const createUserSchema = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    // eslint-disable-next-line
    role: Joi.number().custom((value, helpers) => {
      if (!([0, 1]).includes(value) || value === undefined) {
        return 1;
      }

      if (req.user.role !== 0) {
        return 1;
      }

      return value;
    }),
  });

  await validateRequest(req, res, next, schema);
};
```
And then you can use it on `router middleware`
```typescript
import { createUserSchema } from '../middleware/schema/UserSchema';

export const Users = [
  {
    method: 'post',
    route: '/users',
    controller: UserController,
    action: 'save',
    middleware: [
      createUserSchema, // this your validate shcema
    ],
  },
]
```

### Warning
This not perfect, cos i'm beginer.

### Documentation

> https://documenter.getpostman.com/view/5496504/TzeTKpWu



