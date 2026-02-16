import mongoose from 'mongoose';
import Image from './imageModel.js';

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true 
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

wishlistSchema.index({ user: 1, 'items.product': 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;