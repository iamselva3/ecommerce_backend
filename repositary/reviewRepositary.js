import mongoose from 'mongoose';
import Review from '../model/ReviewModel.js';

class ReviewRepository {
  async create(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  async findByProductId(productId, page = 1, limit = 10, filters = {}) {
    const query = { product: productId, ...filters };
    
    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Review.countDocuments(query);
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    return await Review.findById(id).populate('user', 'name email');
  }

  async findByIdAndUpdate(id, updateData) {
    return await Review.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
  }

  async deleteById(id) {
    return await Review.findByIdAndDelete(id);
  }

  async getProductStats(productId) {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
      { $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: '$rating'
        }
      }}
    ]);
    
    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
    
    const ratingCounts = stats[0].ratingCounts.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    
    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution: ratingCounts
    };
  }

  async findByUserAndProduct(userId, productId) {
    return await Review.findOne({ user: userId, product: productId });
  }
}

export default ReviewRepository;