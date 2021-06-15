import { getRepository } from 'typeorm';
import * as dotenv from 'dotenv';
import User from '../entity/User';

dotenv.config();

const mustVerified = async (req, res, next) => {
  const user = await getRepository(User).findOne(req.user.id);

  if (!user.isVerified && user.role !== 0) {
    res.status(401)
      .send({
        status: 'fail',
        message: 'Email not verified',
      });

    return;
  }

  next();
};

export default mustVerified;
