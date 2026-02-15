import express from 'express';
import WishlistController from '../controller/wishlistController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const wishlistController = new WishlistController();

// All wishlist routes require authentication
router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/:productId', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlistStatus);
router.delete('/', wishlistController.clearWishlist);
router.get('/count', wishlistController.getWishlistCount);

export default router;