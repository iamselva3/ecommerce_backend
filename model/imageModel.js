import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // size: {
    //     type: String,
    //     required: true,
    //     enum: [
    //         's',
    //         'm',
    //         'l',
    //         'xl',
    //         'xxl'
    //     ]
    // },
    sizes: {
        type: [String],
        required: true,
        enum: ['s', 'm', 'l', 'xl', 'xxl'],
    },
    price: {
        type: Number,
        required: true
    },
    // url: {
    //     type: String,
    //     required: true
    // },
    // s3Key: {
    //     type: String,
    //     required: true
    // },
    category: {
        type: String,
        required: true,
        enum: [
            'products',
            'shirts',
            't-shirts',
            'pants',
            'shoes',
            'accessories',
            'categories',
            'banners',
            'users',
            'brands',
            'reviews',
            'general'
        ],
        default: 'general'
    },

       images: [{
        url: {
            type: String,
            required: true
        },
        s3Key: {
            type: String,
            required: true
        },
        altText: {
            type: String,
            trim: true
        },
        sortOrder: {
            type: Number,
            default: 0
        }
    }],
    subCategory: {
        type: String,
        trim: true
    },
    // altText: {
    //     type: String,
    //     trim: true
    // },
    tags: [{
        type: String,
        trim: true
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    // sortOrder: {
    //     type: Number,
    //     default: 0
    // },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
imageSchema.index({ category: 1, subCategory: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ isFeatured: 1 });

const Image = mongoose.model('Image', imageSchema);

export default Image;