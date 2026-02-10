import express from 'express';
import OrderController from '../controller/OrderController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
// import { validateOrderCreate } from '../middlewares/validationMiddleware.js';

const router = express.Router();
const orderController = new OrderController();


router.post(
    '/',
    authMiddleware,
    // validateOrderCreate,
    orderController.createOrder
);

// Get user orders
router.get(
    '/my-orders',
    authMiddleware,
    orderController.getUserOrders
);

// Get specific order
router.get(
    '/:orderId',
    authMiddleware,
    orderController.getOrderById
);

// Cancel order
router.post(
    '/:orderId/cancel',
    authMiddleware,
    orderController.cancelOrder
);


// Get all orders
router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    orderController.getAllOrders
);

// Update order status
router.put(
    '/:orderId/status',
    authMiddleware,
    adminMiddleware,
    orderController.updateOrderStatus
);

// Add tracking info
router.post(
    '/:orderId/tracking',
    authMiddleware,
    adminMiddleware,
    orderController.addTrackingInfo
);

// Update payment status
router.put(
    '/:orderId/payment-status',
    authMiddleware,
    adminMiddleware,
    orderController.updatePaymentStatus
);

// Get order statistics
router.get(
    '/stats/orders',
    authMiddleware,
    orderController.getOrderStats
);

// Get recent orders (admin dashboard)
router.get(
    '/recent/orders',
    authMiddleware,
    adminMiddleware,
    orderController.getRecentOrders
);



export default router;