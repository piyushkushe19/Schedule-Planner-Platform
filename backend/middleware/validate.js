const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    return res.status(400).json({ error: details });
  }
  next();
};

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    timezone: Joi.string().default('UTC'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    username: Joi.string().alphanum().min(3).max(30),
    timezone: Joi.string(),
    bio: Joi.string().max(300).allow(''),
    meetingDuration: Joi.number().valid(15, 30, 45, 60, 90),
    bufferTime: Joi.number().min(0).max(60),
  }),

  availability: Joi.object({
    availability: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().min(0).max(6).required(),
        isActive: Joi.boolean().required(),
        slots: Joi.array().items(
          Joi.object({
            startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
            endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
          })
        ).required(),
      })
    ).required(),
  }),

  booking: Joi.object({
    guestName: Joi.string().min(2).max(100).required(),
    guestEmail: Joi.string().email().required(),
    startTime: Joi.string().isoDate().required(),
    guestTimezone: Joi.string().default('UTC'),
    notes: Joi.string().max(500).allow(''),
  }),
};

module.exports = { validate, schemas };
