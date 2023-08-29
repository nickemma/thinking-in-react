import express from 'express';
import {
  login,
  logout,
  register,
  getUser,
  updateUser,
  changePassword,
} from '../controllers/userController';
import protect from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/getuser', protect, getUser);
router.patch('/updateuser', protect, updateUser);
router.patch('/changepassword', protect, changePassword);

router.post('/signup', register);
router.post('/signin', login);
router.get('/logout', logout);

export default router;
