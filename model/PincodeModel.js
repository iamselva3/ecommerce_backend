import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'India'
    },
    isDeliverable: {
        type: Boolean,
        default: true
    },
    deliveryDays: {
        type: Number,
        default: 3, // Estimated delivery days
        min: 1,
        max: 10
    },
    codAvailable: {
        type: Boolean,
        default: true // Cash on Delivery available
    },
    expressDelivery: {
        type: Boolean,
        default: false
    },
    expressDeliveryDays: {
        type: Number,
        default: 1
    },
    pickupStores: [{
        storeName: String,
        storeAddress: String,
        storePhone: String,
        distance: Number // in km
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for searching
pincodeSchema.index({ pincode: 1, city: 1, state: 1 });
pincodeSchema.index({ city: 'text', district: 'text' });

const Pincode = mongoose.model('Pincode', pincodeSchema);
export default Pincode;