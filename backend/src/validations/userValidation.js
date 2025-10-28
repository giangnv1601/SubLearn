import Joi from 'joi'

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
const EMAIL_RULE_MESSAGE = 'Invalid email format'
const PASSWORD_RULE_MESSAGE = 'Password must contain at least 6 characters, one uppercase, one lowercase, and one number'

export const registerValidation = async (req, res, next) => {
  const schema = Joi.object({
    fullname: Joi.string().trim().min(3).max(50).required().messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 3 characters',
      'any.required': 'Full name is required'
    }),
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const firstError = error?.details?.[0]?.message || 'Invalid input'
    return res.status(422).json({ message: firstError })
  }
}
