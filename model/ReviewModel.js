import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
//   title: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 100
//   },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  images: [{
    url: String,
    s3Key: String
  }]
}, {
  timestamps: true
});

// Compound index for unique review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;