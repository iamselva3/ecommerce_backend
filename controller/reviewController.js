import ReviewUsecase from '../usecase/reviewUsecase.js';

class ReviewController {
    constructor() {
        this.reviewUsecase = new ReviewUsecase();
    }

    createReview = async (req, res) => {
        try {
            const { productId } = req.params;
            const { rating, title, comment } = req.body;
            const userId = req.user.userId;
            const userName = req.user.name;
            console.log(userId, userName, productId, rating, title, comment);

            const review = await this.reviewUsecase.createReview(
                userId,
                userName,
                productId,
                { rating, title, comment }
            );

            res.status(201).json({
                success: true,
                message: 'Review created successfully',
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    getProductReviews = async (req, res) => {
        try {
            const { productId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const reviews = await this.reviewUsecase.getProductReviews(productId, page, limit);

            res.status(200).json({
                success: true,
                data: reviews
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    updateReview = async (req, res) => {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            const review = await this.reviewUsecase.updateReview(reviewId, userId, updateData);

            res.status(200).json({
                success: true,
                message: 'Review updated successfully',
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    deleteReview = async (req, res) => {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
            const isAdmin = req.user.role === 'admin';

            await this.reviewUsecase.deleteReview(reviewId, userId, isAdmin);

            res.status(200).json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    // Admin routes
    adminToggleReviewStatus = async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { isActive } = req.body;

            const review = await this.reviewUsecase.adminToggleReviewStatus(reviewId, isActive);

            res.status(200).json({
                success: true,
                message: `Review ${isActive ? 'activated' : 'deactivated'} successfully`,
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    markHelpful = async (req, res) => {
        try {
            const { reviewId } = req.params;

            const review = await this.reviewUsecase.markHelpful(reviewId);

            res.status(200).json({
                success: true,
                message: 'Review marked as helpful',
                data: { helpfulCount: review.helpfulCount }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
}

export default ReviewController;