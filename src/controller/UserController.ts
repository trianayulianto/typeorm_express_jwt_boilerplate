/* eslint-disable no-unused-vars */
import { getRepository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import User from '../entity/User';

class UserController {
    private userRepository = getRepository(User);

    async all(req, res, next) {
      await this.userRepository
        .find()
        .then((result) => res
          .status(200)
          .send({
            status: 'success',
            data: {
              result,
            },
          }))
        .catch(next);
    }

    async one(req, res, next) {
      await this.userRepository
        .findOne(req.params.id)
        .then((result) => res
          .status(200)
          .send({
            status: 'success',
            data: {
              result,
            },
          }))
        .catch(next);
    }

    async save(req, res, next) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);

      await this.userRepository
        .save(req.body)
        .then((result) => res
          .status(201)
          .send({
            status: 'success',
            message: 'User berhasil dibuat',
            data: {
              id: result.id,
            },
          }))
        .catch(next);
    }

    async update(req, res, next) {
      if (req.body.password !== undefined) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }

      await this.userRepository
        .update({ id: Number(req.params.id) }, req.body)
        .then(() => res
          .status(201)
          .send({
            status: 'success',
            message: 'User berhasil diubah',
          }))
        .catch(next);
    }

    async remove(req, res, next) {
      const userToRemove = await this.userRepository.findOne(req.params.id);

      await this.userRepository
        .remove(userToRemove)
        .then(() => res
          .status(201)
          .send({
            status: 'success',
            message: 'User berhasil dihapus',
          }))
        .catch(next);
    }
}

export default UserController;
