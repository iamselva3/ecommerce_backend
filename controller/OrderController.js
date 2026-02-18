import OrderUsecase from '../usecase/OrderUsecase.js';

class OrderController {
    constructor() {
        this.orderUsecase = new OrderUsecase();
    }

    // Create new order
    createOrder = async (req, res) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;

            console.log(userId);

            const result = await this.orderUsecase.createOrder(userId, req.body);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message || 'Order placed successfully',
                    data: result.data,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Create order controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Get order by ID
    getOrderById = async (req, res) => {
        try {
            const { orderId } = req.params;
            const userId = req.user.userId;
            const userRole = req.user.role;

            const result = await this.orderUsecase.getOrderById(orderId, userId, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            } else {
                const status = result.error === 'Order not found' ? 404 :
                    result.error === 'Unauthorized to view this order' ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Get order controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Get user orders
    getUserOrders = async (req, res) => {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 10, status } = req.query;

            const result = await this.orderUsecase.getUserOrders(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                status,
            });

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Get user orders controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Get all orders (admin)
    getAllOrders = async (req, res) => {
        try {
            const userRole = req.user.role;
            const { page = 1, limit = 20, status, userId } = req.query;

            const result = await this.orderUsecase.getAllOrders(userRole, {
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                userId,
            });

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            } else {
                const status = result.error === 'Admin access required' ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Get all orders controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Update order status (admin)
    updateOrderStatus = async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status, message } = req.body;
            const userRole = req.user.role;

            const result = await this.orderUsecase.updateOrderStatus(orderId, status, message, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data,
                });
            } else {
                const statusCode = result.error === 'Admin access required' ? 403 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Update status controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Cancel order
    cancelOrder = async (req, res) => {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.role;

            const result = await this.orderUsecase.cancelOrder(orderId, userId, userRole, reason);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data,
                });
            } else {
                const status = result.error === 'Unauthorized to cancel this order' ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Cancel order controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Add tracking info (admin)
    addTrackingInfo = async (req, res) => {
        try {
            const { orderId } = req.params;
            const trackingInfo = req.body;
            const userRole = req.user.role;

            const result = await this.orderUsecase.addTrackingInfo(orderId, trackingInfo, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data,
                });
            } else {
                const status = result.error === 'Admin access required' ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Add tracking controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Update payment status (admin)
    updatePaymentStatus = async (req, res) => {
        try {
            const { orderId } = req.params;
            const { paymentStatus, transactionId } = req.body;
            const userRole = req.user.role;

            const result = await this.orderUsecase.updatePaymentStatus(orderId, paymentStatus, transactionId, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data,
                });
            } else {
                const status = result.error === 'Admin access required' ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Update payment status controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Get order statistics
    getOrderStats = async (req, res) => {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;

            const result = await this.orderUsecase.getOrderStats(userId, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Get stats controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };

    // Get recent orders (admin dashboard)
    getRecentOrders = async (req, res) => {
        try {
            const userRole = req.user.role;
            const { limit = 10 } = req.query;

            const result = await this.orderUsecase.getRecentOrders(userRole, parseInt(limit));

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            } else {
                const status = result.error === 'Admin access required' ? 403 : 400;
                res.status(status).json({
                    success: false,
                    message: result.error,
                });
            }
        } catch (error) {
            console.error('Get recent orders controller error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message,
            });
        }
    };



}

export default OrderController;