import express from 'express';
import {
  login,
  logout,
  register,
  getUser,
} from '../controllers/userController';
import protect from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/getuser', protect, getUser);

router.post('/signup', register);
router.post('/signin', login);
router.get('/logout', logout);

export default router;
