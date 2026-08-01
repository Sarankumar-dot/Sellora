import Joi from 'joi';
import {
  createSchema,
  requiredStringValidator,
  emailValidator,
  passwordValidator,
  mobileNumberValidator,
  otpValidator,
  nameValidator,
} from './common.validation.js';

export const registerSchema = createSchema({
  name: nameValidator(),
  email: emailValidator,
  password: passwordValidator,
  mobile_number: mobileNumberValidator,
}).rename('mobileNumber', 'mobile_number', {
  alias: false,
  override: true,
  ignoreUndefined: true,
});

export const loginSchema = createSchema({
  email: emailValidator,
  password: requiredStringValidator('Password'),
});

export const forgotPasswordSchema = createSchema({
  email: emailValidator,
});

export const resetPasswordSchema = createSchema({
  email: emailValidator,
  otp: otpValidator,
  newPassword: passwordValidator,
});

export const changePasswordSchema = createSchema({
  oldPassword: requiredStringValidator('Old Password'),
  newPassword: passwordValidator,
});
