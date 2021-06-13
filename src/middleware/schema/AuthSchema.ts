import * as Joi from 'joi';
import validateRequest from '../ValidateRequest';

export const authenticateSchema = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  await validateRequest(req, res, next, schema);
};

export const registerSchema = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  });

  await validateRequest(req, res, next, schema);
};

export const revokeTokenSchema = async (req, res, next) => {
  let schema;

  if (req.cookies.refreshToken === undefined) {
    schema = Joi.object({
      token: Joi.string().required(),
    });
  } else {
    schema = Joi.object({
      token: Joi.string().empty(''),
    });
  }

  await validateRequest(req, res, next, schema);
};

export const verifyEmailSchema = async (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
  });

  await validateRequest(req, res, next, schema);
};

export const forgotPasswordSchema = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  await validateRequest(req, res, next, schema);
};

export const resetPasswordSchema = async (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  });

  await validateRequest(req, res, next, schema);
};
