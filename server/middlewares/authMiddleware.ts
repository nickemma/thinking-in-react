import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';

const secret = process.env.JWT_SECRET || '';

const protect = async (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  const requestToken = token || req.headers.authorization?.split(' ')[1];

  if (requestToken) {
    try {
      const decoded: any = jwt.verify(requestToken, secret);

      req.User = decoded.id;

      next();
    } catch (err: any) {
      res.clearCookie(token);
      return res.status(400).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
