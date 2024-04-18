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
  const requestToken = cookieToken || req.headers.authorization?.split(' ')[1];

  if (requestToken) {
    try {
      // verify token
      const decoded: any = jwt.verify(requestToken, secretKey as Secret);

      // get user id from decoded token
      req.user = decoded.id;

      // pass user to next middleware
      next();
    } catch (error) {
    
      return res.status(401).json({ message: 'Unauthorized Access' });
    }
  } else {
    res.status(401).json({ message: 'Access denied, no token' });
  }
};

export default protect;
