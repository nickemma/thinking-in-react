import express from 'express';
import {
  login,
  logout,
  register,
  getUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/userController';
import protect from '../middlewares/authMiddleware';

const router = express.Router();

router.patch('/updateuser', protect, updateUser);
router.patch('/changepassword', protect, changePassword);

router.post('/signup', register);
router.post('/signin', login);
router.post('/forgotpassword', forgotPassword);

router.get('/getuser', protect, getUser);
router.get('/logout', logout);

router.put('/resetpassword/:resetToken', resetPassword);

export default router;
