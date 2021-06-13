/* eslint-disable no-unused-vars */
import { getRepository } from 'typeorm';
import Todo from '../entity/Todo';

class TodoController {
  todoRepository = getRepository(Todo);

  async all(req, res, next) {
    await this.todoRepository
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
    await this.todoRepository
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
    await this.todoRepository
      .save(req.body)
      .then((result) => res
        .status(201)
        .send({
          status: 'success',
          message: 'Todo berhasil dibuat',
          data: {
            id: result.id,
          },
        }))
      .catch(next);
  }

  async update(req, res, next) {
    await this.todoRepository
      .update({ id: Number(req.params.id) }, req.body)
      .then(() => res
        .status(201)
        .send({
          status: 'success',
          message: 'Todo berhasil diubah',
        }))
      .catch(next);
  }

  async remove(req, res, next) {
    const todoToRemove = await this.todoRepository.findOne(req.params.id);

    await this.todoRepository
      .remove(todoToRemove)
      .then(() => res
        .status(201)
        .send({
          status: 'success',
          message: 'Todo berhasil dihapus',
        }))
      .catch(next);
  }
}

export default TodoController;
