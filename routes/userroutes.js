import express from 'express';
import UserController from '../controller/usercontroller.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
import { validateRegister, validateLogin } from '../middlewares/validationMiddleware.js';

const router = express.Router();
const userController = new UserController();

// Public routes
router.post('/register', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected routes (authenticated users)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Admin only routes
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, adminMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, adminMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

export default router;