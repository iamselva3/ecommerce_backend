import express from 'express';
import AuthController from '../controller/authContoller.js';
import UserController from '../controller/usercontroller.js';

const router = express.Router();
const authController = new AuthController();
const userController = new UserController();

// Social login routes
router.post('/google', authController.googleLogin);
router.post('/apple', authController.appleLogin);

// Logout (clears HttpOnly cookie)
router.post('/logout', userController.logout);

export default router;