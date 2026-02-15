import express from 'express';
import ReviewController from '../controller/reviewController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const reviewController = new ReviewController();

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.post('/:reviewId/helpful', reviewController.markHelpful);

// Protected user routes
router.post(
    '/product/:productId',
    authMiddleware,
    reviewController.createReview
);

router.put(
    '/:reviewId',
    authMiddleware,
    reviewController.updateReview
);

router.delete(
    '/:reviewId',
    authMiddleware,
    reviewController.deleteReview
);

// Admin routes
router.patch(
    '/:reviewId/toggle-status',
    authMiddleware,
    adminMiddleware,
    reviewController.adminToggleReviewStatus
);

export default router;