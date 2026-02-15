import ReviewRepository from '../repositary/reviewRepositary.js';

class ReviewUsecase {
    constructor() {
        this.reviewRepository = new ReviewRepository();
    }

    async createReview(userId, userName, productId, reviewData) {
        // Check if user already reviewed this product
        const existingReview = await this.reviewRepository.findByUserAndProduct(
            userId,
            productId
        );

        if (existingReview) {
            throw new Error('You have already reviewed this product');
        }

        const review = await this.reviewRepository.create({
            user: userId,
            userName,
            product: productId,
            ...reviewData
        });

        return review;
    }

    async getProductReviews(productId, page = 1, limit = 10) {
        const reviews = await this.reviewRepository.findByProductId(
            productId,
            page,
            limit,
            { isActive: true }
        );

        const stats = await this.reviewRepository.getProductStats(productId);

        return {
            ...reviews,
            stats
        };
    }

    async updateReview(reviewId, userId, updateData) {
        const review = await this.reviewRepository.findById(reviewId);

        if (!review) {
            throw new Error('Review not found');
        }

        // Only allow user to update their own review
        if (review.user._id.toString() !== userId) {
            throw new Error('Not authorized to update this review');
        }

        const updatedReview = await this.reviewRepository.findByIdAndUpdate(
            reviewId,
            updateData
        );

        return updatedReview;
    }

    async deleteReview(reviewId, userId, isAdmin = false) {
        const review = await this.reviewRepository.findById(reviewId);

        if (!review) {
            throw new Error('Review not found');
        }

        // Allow admin or review owner to delete
        if (!isAdmin && review.user._id.toString() !== userId) {
            throw new Error('Not authorized to delete this review');
        }

        return await this.reviewRepository.deleteById(reviewId);
    }

    async adminToggleReviewStatus(reviewId, isActive) {
        const review = await this.reviewRepository.findByIdAndUpdate(
            reviewId,
            { isActive }
        );

        if (!review) {
            throw new Error('Review not found');
        }

        return review;
    }

    async markHelpful(reviewId) {
        const review = await this.reviewRepository.findById(reviewId);

        if (!review) {
            throw new Error('Review not found');
        }

        review.helpfulCount += 1;
        return await review.save();
    }
}

export default ReviewUsecase;