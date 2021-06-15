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

export const updateUserSchema = async (req, res, next) => {
  const schemaRules = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    // eslint-disable-next-line
    role: Joi.number().custom((value, helpers) => {
      if (!([0, 1]).includes(value)) {
        return 1;
      }

      if (req.user.role !== 0) {
        return 1;
      }

      return value;
    }),
  };

  const schema = Joi.object(schemaRules).with('password', 'confirmPassword');

  await validateRequest(req, res, next, schema);
};
