import Order from '../model/OrderModel.js';

class OrderRepository {
    // Create new order
    async create(orderData) {
        try {
            const order = new Order(orderData);
            return await order.save();
        } catch (error) {
            throw error;
        }
    }

    // Find order by ID
    async findById(orderId, populate = true) {
        try {
            let query = Order.findById(orderId);

            if (populate) {
                query = query.populate('user', 'name email phone')
                    .populate('items.productId', 'name url category');
            }

            return await query.exec();
        } catch (error) {
            throw error;
        }
    }

    // Find order by orderId (public ID)
    async findByOrderId(orderId, userId = null) {
        try {
            const query = { orderId };
            if (userId) {
                query.user = userId;
            }

            return await Order.findOne(query)
                .populate('user', 'name email phone')
                .populate('items.productId', 'name url category')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Find all orders for a user
    async findByUser(userId, options = {}) {
        try {
            const { page = 1, limit = 10, status = null } = options;
            const skip = (page - 1) * limit;

            const query = { user: userId };
            if (status) {
                query.orderStatus = status;
            }

            const orders = await Order.find(query)
                .populate('items.productId', 'name url')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Order.countDocuments(query);

            return {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    // Find all orders (admin)
    async findAll(options = {}) {
        try {
            const { page = 1, limit = 20, status = null, userId = null } = options;
            const skip = (page - 1) * limit;

            const query = {};
            if (status) {
                query.orderStatus = status;
            }
            if (userId) {
                query.user = userId;
            }

            const orders = await Order.find(query)
                .populate('user', 'name email phone')
                .populate('items.productId', 'name url')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Order.countDocuments(query);

            return {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            throw error;
        }
    }

    // Update order
    async update(orderId, updateData) {
        try {
            return await Order.findByIdAndUpdate(
                orderId,
                updateData,
                { new: true, runValidators: true }
            )
                .populate('user', 'name email phone')
                .populate('items.productId', 'name url')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Update order status
    async updateStatus(orderId, status, message = null) {
        try {
            const order = await this.findById(orderId, false);
            if (!order) {
                throw new Error('Order not found');
            }

            return await order.updateStatus(status, message);
        } catch (error) {
            throw error;
        }
    }

    // Update payment status
    async updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
        try {
            const updateData = {
                paymentStatus,
                'paymentDetails.status': paymentStatus,
            };

            if (transactionId) {
                updateData['paymentDetails.transactionId'] = transactionId;
            }

            if (paymentStatus === 'paid') {
                updateData['paymentDetails.paidAmount'] = await this.findById(orderId, false)
                    .then(order => order.totalAmount);
            }

            return await this.update(orderId, updateData);
        } catch (error) {
            throw error;
        }
    }

    // Add tracking info
    async addTrackingInfo(orderId, trackingInfo) {
        try {
            const updateData = {
                tracking: trackingInfo,
                orderStatus: 'shipped',
            };

            if (trackingInfo.shippedAt) {
                updateData.tracking.shippedAt = trackingInfo.shippedAt;
            }

            return await this.update(orderId, updateData);
        } catch (error) {
            throw error;
        }
    }

    // Cancel order
    async cancelOrder(orderId, reason = 'Cancelled by user') {
        try {
            const order = await this.findById(orderId, false);

            // Check if order can be cancelled
            const cancellableStatuses = ['pending', 'confirmed', 'processing'];
            if (!cancellableStatuses.includes(order.orderStatus)) {
                throw new Error(`Cannot cancel order with status: ${order.orderStatus}`);
            }

            return await this.updateStatus(orderId, 'cancelled', reason);
        } catch (error) {
            throw error;
        }
    }

    // Get order statistics
    async getStats(userId = null) {
        try {
            return await Order.getStats(userId);
        } catch (error) {
            throw error;
        }
    }

    // Get recent orders
    async getRecentOrders(limit = 5) {
        try {
            return await Order.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Get orders by date range
    async getOrdersByDateRange(startDate, endDate, userId = null) {
        try {
            const query = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            };

            if (userId) {
                query.user = userId;
            }

            return await Order.find(query)
                .populate('user', 'name email')
                .populate('items.productId', 'name url')
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Delete order (admin only)
    async delete(orderId) {
        try {
            return await Order.findByIdAndDelete(orderId);
        } catch (error) {
            throw error;
        }
    }


    

    // Clear user's cart
   
}

export default OrderRepository;