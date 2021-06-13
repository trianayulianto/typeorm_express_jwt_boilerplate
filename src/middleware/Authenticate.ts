import * as dotenv from 'dotenv';
import * as jwt from 'express-jwt';

dotenv.config();

const secret = process.env.TOKEN_SECRET;

const authenticate = jwt({ secret, algorithms: ['HS256'] });

export default authenticate;
