import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { Request, Response } from 'express';

const secret = process.env.JWT_SECRET || '';
const tokenExpiration = '7d';
/*
 * @route   GET /users
 * @desc    Get all users
 * @access  Public
 */

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST /users/signup
 * @desc    Register a new user
 * @access  Public
 */

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, secret, {
      expiresIn: tokenExpiration,
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST /users/signin
 * @desc    Login a user
 * @access  Public
 */

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: tokenExpiration,
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST /users/signout
 * @desc    Logout a user
 * @access  Public
 */

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
};
