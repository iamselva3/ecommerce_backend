import OrderRepository from '../repositary/OrderRepositary.js';
import CartRepository from '../repositary/Cartrepositary.js';

class OrderUsecase {
    constructor() {
        this.orderRepository = new OrderRepository();
        this.cartRepository = new CartRepository();
    }

    // Create new order
    async createOrder(userId, orderData) {
        try {
            // Validate order data
            if (!orderData.items || orderData.items.length === 0) {
                return {
                    success: false,
                    error: 'Order must contain at least one item',
                };
            }

            if (!orderData.shippingAddress) {
                return {
                    success: false,
                    error: 'Shipping address is required',
                };
            }

            // Calculate totals
            const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const gst = Math.round(subtotal * 0.18);
            const deliveryCharge = subtotal > 999 ? 0 : 49;
            const totalAmount = subtotal + gst + deliveryCharge - (orderData.discount || 0);
            const generateOrderId = () => {
                const timestamp = Date.now().toString().slice(-6);
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                return `#ORD-${timestamp}-${random}`;
            };

            // Create order object
            const order = {
                user: userId,
                 orderId: generateOrderId(), 
                items: orderData.items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size || null,
                    color: item.color || null,
                    image: item.image,
                    totalPrice: item.price * item.quantity,
                })),
                shippingAddress: {
                    fullName: orderData.shippingAddress.fullName,
                    phone: orderData.shippingAddress.phone,
                    street: orderData.shippingAddress.street,
                    city: orderData.shippingAddress.city,
                    state: orderData.shippingAddress.state,
                    pincode: orderData.shippingAddress.pincode,
                    country: orderData.shippingAddress.country || 'India',
                    landmark: orderData.shippingAddress.landmark || '',
                },
                paymentDetails: {
                    method: orderData.paymentMethod || 'cod',
                    status: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
                },
                subtotal,
                gst,
                deliveryCharge,
                discount: orderData.discount || 0,
                totalAmount,
                notes: orderData.notes || '',
                isDirectBuy: orderData.isDirectBuy || false,
            };

            // Save order
            const createdOrder = await this.orderRepository.create(order);

            // Clear cart if not direct buy
            if (!orderData.isDirectBuy && userId) {
                await this.cartRepository.clearCart(userId);
            }

            return {
                success: true,
                data: { order: createdOrder },
                message: 'Order placed successfully',
            };
        } catch (error) {
            console.error('Create order error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create order',
            };
        }
    }

    // Get order by ID
    async getOrderById(orderId, userId, userRole) {
        try {
            const order = await this.orderRepository.findByOrderId(orderId);

            if (!order) {
                return {
                    success: false,
                    error: 'Order not found',
                };
            }

            // Check authorization (user can view own orders, admin can view all)
            if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
                return {
                    success: false,
                    error: 'Unauthorized to view this order',
                };
            }

            return {
                success: true,
                data: { order },
            };
        } catch (error) {
            console.error('Get order error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get order',
            };
        }
    }

    // Get user orders
    async getUserOrders(userId, options = {}) {
        try {
            const result = await this.orderRepository.findByUser(userId, options);

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error('Get user orders error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get orders',
            };
        }
    }

    // Get all orders (admin)
    async getAllOrders(userRole, options = {}) {
        try {
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required',
                };
            }

            const result = await this.orderRepository.findAll(options);

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error('Get all orders error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get orders',
            };
        }
    }

    // Update order status (admin)
    async updateOrderStatus(orderId, status, message, userRole) {
        try {
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required',
                };
            }

            const order = await this.orderRepository.updateStatus(orderId, status, message);

            return {
                success: true,
                data: { order },
                message: `Order status updated to ${status}`,
            };
        } catch (error) {
            console.error('Update status error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update order status',
            };
        }
    }

    // Cancel order
    async cancelOrder(orderId, userId, userRole, reason = 'Cancelled by user') {
        try {
            const order = await this.orderRepository.findByOrderId(orderId);

            if (!order) {
                return {
                    success: false,
                    error: 'Order not found',
                };
            }

            // Check authorization
            if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
                return {
                    success: false,
                    error: 'Unauthorized to cancel this order',
                };
            }

            const cancelledOrder = await this.orderRepository.cancelOrder(orderId, reason);

            return {
                success: true,
                data: { order: cancelledOrder },
                message: 'Order cancelled successfully',
            };
        } catch (error) {
            console.error('Cancel order error:', error);
            return {
                success: false,
                error: error.message || error.message || 'Failed to cancel order',
            };
        }
    }

    // Add tracking info (admin)
    async addTrackingInfo(orderId, trackingInfo, userRole) {
        try {
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required',
                };
            }

            const order = await this.orderRepository.addTrackingInfo(orderId, trackingInfo);

            return {
                success: true,
                data: { order },
                message: 'Tracking information added',
            };
        } catch (error) {
            console.error('Add tracking error:', error);
            return {
                success: false,
                error: error.message || 'Failed to add tracking info',
            };
        }
    }

    // Update payment status
    async updatePaymentStatus(orderId, paymentStatus, transactionId = null, userRole) {
        try {
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required',
                };
            }

            const order = await this.orderRepository.updatePaymentStatus(orderId, paymentStatus, transactionId);

            return {
                success: true,
                data: { order },
                message: `Payment status updated to ${paymentStatus}`,
            };
        } catch (error) {
            console.error('Update payment status error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update payment status',
            };
        }
    }

    // Get order statistics
    async getOrderStats(userId, userRole) {
        try {
            let stats;

            if (userRole === 'admin') {
                stats = await this.orderRepository.getStats(); // All orders
            } else {
                stats = await this.orderRepository.getStats(userId); // User's orders only
            }

            return {
                success: true,
                data: { stats },
            };
        } catch (error) {
            console.error('Get stats error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get statistics',
            };
        }
    }

    // Get recent orders (admin dashboard)
    async getRecentOrders(userRole, limit = 10) {
        try {
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required',
                };
            }

            const orders = await this.orderRepository.getRecentOrders(limit);

            return {
                success: true,
                data: { orders },
            };
        } catch (error) {
            console.error('Get recent orders error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get recent orders',
            };
        }
    }

}

export default OrderUsecase;