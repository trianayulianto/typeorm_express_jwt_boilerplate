const validateRequest = async (req, res, next, schema) => {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  const { error, value } = await schema.validate(req.body, options);

  if (error) {
    res.status(401).send({
      status: 'fail',
      errors: error.details.map((x) => ({
        path: x.path,
        message: x.message,
      })),
    });

    return;
  }

  req.body = value;

  next();
};

export default validateRequest;
