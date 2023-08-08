import express from 'express';
import {
  login,
  logout,
  register,
  getUsers,
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/users', protect, getUsers);

router.post('/signup', register);
router.post('/signin', login);
router.post('/signout', logout);

export default router;
