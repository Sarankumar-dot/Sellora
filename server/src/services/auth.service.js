import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/ApiError.js';
import { findUserByEmail, createUser } from '../models/user.model.js';

const registerUser = async (userData) => {
  const { name, email, password, mobile_number } = userData;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, 'User already exist');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await createUser({ name, email, password: hashPassword, mobile_number });

  return {
    id: result,
    name,
    email,
    mobile_number,
  };
};

const loginUser = async (userData) => {
  const { email, password } = userData;

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  return {
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    },
  };
};

export { registerUser, loginUser };
