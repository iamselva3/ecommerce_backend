import express from 'express';
import PaymentMethodController from '../controller/PaymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const paymentMethodController = new PaymentMethodController();

// All routes require authentication
router.use(authMiddleware);

// Payment method routes
router.post('/', paymentMethodController.addPaymentMethod);
router.get('/', paymentMethodController.getPaymentMethods);
router.put('/:id', paymentMethodController.updatePaymentMethod);
router.delete('/:id', paymentMethodController.deletePaymentMethod);
router.patch('/:id/default', paymentMethodController.setDefaultPaymentMethod);

export default router;