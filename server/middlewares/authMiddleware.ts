import { NextFunction, Response } from 'express';
import AuthorizedRequest from '../types/request';
import jwt, { Secret } from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET;

const protect = async (
  // req: AuthorizedRequest<any>,
  req: AuthorizedRequest<any>,
  res: Response,
  next: NextFunction
) => {
  // If system doesn't support cookies, use authorization header
  const cookieToken = req.cookies.token;
  console.log('Verifying token...');
  console.log('Cookie Token:', cookieToken);

  if (cookieToken) {
    try {
      // verify token
      const decoded: any = jwt.verify(cookieToken, secretKey as Secret);
      console.log('Decoded Token Middleware:', decoded);
      // get user id from decoded token
      req.user = decoded.id;
      console.log('User ID:', req.user);

      // pass user to next middleware
      next();
    } catch (error) {
      console.error('Token Verification Error:', error);
      return res.status(401).json({ message: 'Unauthorized Access' });
    }
  } else {
    res.status(401).json({ message: 'Access denied, no token' });
  }
};

export default protect;
