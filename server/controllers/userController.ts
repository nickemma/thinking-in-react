import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/userModel';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import AuthorizedRequest from '../types/request';

/*
 * @desc    Generate a token
 * @access  Private
 */

const secretKey = process.env.JWT_SECRET;
const tokenExpiration = process.env.NODE_ENV === 'development' ? '1d' : '7d';

const generateToken = (id: string) => {
  console.log('Generating token for ID:', id);
  return jwt.sign({ id }, secretKey as Secret, {
    expiresIn: tokenExpiration,
  });
};

/*
 * @route   GET api/users
 * @desc    Get A user Profile
 * @access  Private
 */

export const getUser = async (req: AuthorizedRequest<any>, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Getting user with ID:', id);
    const user = await User.findById(req.user).select('-password');
    if (user) {
      const { _id, name, email, image, bio, phone } = user;
      res.status(200).json({ _id, name, email, image, bio, phone });
    } else {
      res.status(400).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/signup
 * @desc    Register a new user
 * @access  Public
 */

export const register = async (req: Request, res: Response) => {
  const { name, email, password, image, bio, phone } = req.body;

  try {
    // validations here
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      image,
      bio,
      phone,
    });

    // Convert ObjectId to string
    const token = generateToken(user._id.toString());

    // Set the token in a cookie with the same name as the token
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      sameSite: 'none',
      secure: true,
    });

    if (user) {
      const { _id, name, email, image, bio, phone } = user;
      console.log(
        'User verified and created successfully. Generating token...'
      );
      console.log('Decoded Token Register:', token); // Make sure to decode the token here
      res.status(201).json({ _id, name, email, image, bio, phone, token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/signin
 * @desc    Login a user
 * @access  Public
 */

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // validations here
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found, please signup' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Convert ObjectId to string
    const token = generateToken(user._id.toString());
    // Set the token in a cookie with the same name as the token
    res.cookie('token', token, {
      path: '/',
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      sameSite: 'none',
      secure: true,
    });

    if (user && isPasswordValid) {
      const { _id, name, email, image, bio, phone } = user;
      console.log('User verified and password valid. Generating token...');
      console.log('Decoded Token Login:', token); // Make sure to decode the token here
      res.status(200).json({ _id, name, email, image, bio, phone, token });
    } else {
      res.status(400).json({ message: 'Invalid Email or Password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/logout
 * @desc    Logout a user
 * @access  Public
 */

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token').json({ message: 'Logged out successfully' });
};
