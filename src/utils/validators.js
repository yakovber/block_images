// validators.js
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required()
      .messages({
      'string.base': 'שם המשתמש חייב להיות טקסט',
      'string.email': 'יש להזין כתובת דוא"ל תקינה',
      'string.empty': 'יש להזין שם משתמש',
      'any.required': 'שדה שם המשתמש הוא חובה'
    }),
  password: Joi.string()
      .messages({
      'string.empty': 'יש להזין סיסמה',
      'string.min': 'הסיסמה חייבת להכיל לפחות {#limit} תווים',
      'any.required': 'שדה הסיסמה הוא חובה'
    }).min(6).required(),
  adminCode: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema
};