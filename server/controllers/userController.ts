import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/userModel';
import Token from '../models/tokenModel';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import AuthorizedRequest from '../types/request';
import crypto from 'crypto';
import sendMail from '../utils/sendMail';

/*
 * @desc    Generate a token
 * @access  Private
 */

const secretKey = process.env.JWT_SECRET;
const tokenExpiration = process.env.NODE_ENV === 'development' ? '1d' : '7d';

const generateToken = (id: string) => {
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
    const user = await User.findById(req.user).select('-password');
    if (user) {
      const { _id, name, email, image, bio, phone } = user;
      res.status(200).json({ _id, name, email, image, bio, phone });
    } else {
      res.status(400).json({ message: 'User not found' });
    }
  } catch (error: any) {
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
      res.status(201).json({ _id, name, email, image, bio, phone, token });
    }
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // Handle validation error
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return res
        .status(400)
        .json({ message: 'Validation error', errors: validationErrors });
    }

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
      res.status(200).json({ _id, name, email, image, bio, phone, token });
    } else {
      res.status(400).json({ message: 'Invalid Email or Password' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/updateuser
 * @desc    Update a user
 * @access  Private
 */

export const updateUser = async (
  req: AuthorizedRequest<any>,
  res: Response
) => {
  try {
    const user = await User.findById(req.user);
    if (user) {
      const { name, email, image, bio, phone } = user;
      user.email = email;
      user.name = req.body.name || name;
      user.image = req.body.image || image;
      user.bio = req.body.bio || bio;
      user.phone = req.body.phone || phone;

      const updatedUser = await user.save();
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
      });
    } else {
      res.status(400).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/change-password
 * @desc    Change a user's password
 * @access  Private
 */

export const changePassword = async (
  req: AuthorizedRequest<any>,
  res: Response
) => {
  try {
    const user = await User.findById(req.user);
    const { password, oldPassword } = req.body;
    if (!user) {
      return res.status(400).json({ message: 'User not found, Sign-Up' });
    }
    // validations here
    if (!password || !oldPassword) {
      return res.status(400).json({ message: 'Please add old & new password' });
    }

    // Check if old password is correct
    if (!user.password) {
      return res.status(400).json({ message: 'Please enter correct password' });
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (user && isPasswordValid) {
      user.password = password;
      await user.save();
      res.status(200).json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Old Password is incorrect, try again' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/forgot-password
 * @desc    Forgot a user's password
 * @access  Public
 */

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found, Sign-Up' });
    }

    // check if there is a token in the database
    const token = await Token.findOne({ userId: user._id });

    // if there is a token, delete it
    if (token) {
      await token.deleteOne();
    }
    // create a reset token
    const resetToken = crypto.randomBytes(32).toString('hex') + user._id;

    // hash the reset token and save it to the database
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // save the hashed reset token to the database
    await Token.create({
      userId: user._id,
      token: hashedResetToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // expires in 5 minutes
    });

    // construct the reset password url
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    // send the reset password url to the user's email
    const message = `
      <h2>Hello ${user.name} You have requested a password reset</h2>
      <p>Please use the link below to reset your password</p> 
      <p>This link is valid for 5 minutes</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
      <p><strong> <em>Regards...</em></strong></p>
      <p>LazyCoders Team</p>
    `;
    const subject = 'Password Reset Request';
    const send_to = user.name;
    const send_from = process.env.EMAIL_HOST_USER;

    // send the email
    await sendMail(send_to, subject, message, send_from, email);
    res.status(200).json({
      success: true,
      message: `A password reset link has been sent to ${email}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

/*
 * @route   POST api/users/reset-password
 * @desc    Reset a user's password
 * @access  Public
 */

export const resetPassword = async (req: Request, res: Response) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    //  hash the reset token and find the user with the token
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // find the token in the database
    const userToken = await Token.findOne({
      token: hashedResetToken,
      expiresAt: { $gt: Date.now() },
    });

    // if the token is not found
    if (!userToken) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired reset token' });
    }

    // find the user with the token
    const user = await User.findById({ _id: userToken.userId });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: any) {
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
