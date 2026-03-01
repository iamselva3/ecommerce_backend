import express from 'express';
import AuthController from '../controller/authContoller.js';

const router = express.Router();
const authController = new AuthController();

// Social login routes
router.post('/google', authController.googleLogin);
router.post('/apple', authController.appleLogin);


export default router;