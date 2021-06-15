import * as Joi from 'joi';
import validateRequest from '../ValidateRequest';

const todoSchema = async (req, res, next) => {
  const schema = Joi.object({
    task: Joi.string().required(),
    priority: Joi.string().valid('high', 'medium', 'low').required(),
    done: Joi.boolean().optional(),
  });

  await validateRequest(req, res, next, schema);
};

export default todoSchema;
