import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image', // Assuming products are stored in Image collection
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        size: {
            type: String,
            default: null,
        },
        color: {
            type: String,
            default: null,
        },
        image: {
            type: String,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    }],
    shippingAddress: {
        fullName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: 'India',
        },
        landmark: {
            type: String,
            default: '',
        },
    },
    paymentDetails: {
        method: {
            type: String,
            enum: ['cod', 'card', 'upi', 'netbanking'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending','shipped', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        transactionId: {
            type: String,
            default: null,
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
    },
    orderStatus: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'returned',
            'refunded',
        ],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    subtotal: {
        type: Number,
        required: true,
    },
    gst: {
        type: Number,
        required: true,
    },
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        default: '',
    },
    isDirectBuy: {
        type: Boolean,
        default: false,
    },
    tracking: {
        courierName: String,
        trackingNumber: String,
        trackingUrl: String,
        estimatedDelivery: Date,
        shippedAt: Date,
        deliveredAt: Date,
    },
    orderTimeline: [{
        status: String,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

// Generate unique order ID
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderId = `ORD-${timestamp}-${random}`;
    }

    // Add to timeline
    if (this.isNew) {
        this.orderTimeline.push({
            status: 'pending',
            message: 'Order placed successfully',
        });
    }
    // next();
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'paymentDetails.method': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'tracking.trackingNumber': 1 });

// Virtual for formatted address
orderSchema.virtual('formattedAddress').get(function () {
    const addr = this.shippingAddress;
    return `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`;
});

// Instance method to update status
orderSchema.methods.updateStatus = function (status, message) {
    this.orderStatus = status;
    this.orderTimeline.push({
        status,
        message: message || `Order ${status}`,
    });
    return this.save();
};

// Static method to get statistics
orderSchema.statics.getStats = async function (userId = null) {
    const match = userId ? { user: userId } : {};

    return {
        total: await this.countDocuments(match),
        pending: await this.countDocuments({ ...match, orderStatus: 'pending' }),
        delivered: await this.countDocuments({ ...match, orderStatus: 'delivered' }),
        cancelled: await this.countDocuments({ ...match, orderStatus: 'cancelled' }),
        revenue: userId ? null : await this.aggregate([
            { $match: { orderStatus: 'delivered', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(res => res[0]?.total || 0),
    };
};

const Order = mongoose.model('Order', orderSchema);

export default Order;