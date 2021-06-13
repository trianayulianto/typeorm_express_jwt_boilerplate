import * as Joi from 'joi';
import validateRequest from '../ValidateRequest';

export const createSchema = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    role: Joi.string().valid([0, 1]).required(),
  });

  await validateRequest(req, res, next, schema);
};

export const updateSchema = async (req, res, next) => {
  const schemaRules = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
    role: Joi.optional(),
  };

  // only admins can update role
  if (req.user.role === 0) {
    schemaRules.role = Joi.string().valid([0, 1]).empty('');
  }

  const schema = Joi.object(schemaRules).with('password', 'confirmPassword');

  await validateRequest(req, res, next, schema);
};
