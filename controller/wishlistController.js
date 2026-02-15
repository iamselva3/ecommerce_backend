import WishlistUsecase from '../usecase/wishlistUsecase.js';

class WishlistController {
    constructor() {
        this.wishlistUsecase = new WishlistUsecase();
    }

    getWishlist = async (req, res) => {
        try {
            const userId = req.user.id || req.user.userId;
            const wishlist = await this.wishlistUsecase.getWishlist(userId);

            res.status(200).json({
                success: true,
                data: wishlist
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    getWishlistCount = async (req, res) => {
        try {
            const userId = req.user.id || req.user.userId;
            const count = await this.wishlistUsecase.getWishlistCount(userId);

            res.status(200).json({
                success: true,
                count
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    addToWishlist = async (req, res) => {
        try {
            const userId = req.user.id || req.user.userId;
            const { productId } = req.params;

            const wishlist = await this.wishlistUsecase.addToWishlist(userId, productId);

            res.status(200).json({
                success: true,
                message: 'Added to wishlist',
                data: wishlist
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    removeFromWishlist = async (req, res) => {
        try {
            const userId = req.user.id || req.user.userId;
            const { productId } = req.params;

            const wishlist = await this.wishlistUsecase.removeFromWishlist(userId, productId);

            res.status(200).json({
                success: true,
                message: 'Removed from wishlist',
                data: wishlist
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    checkWishlistStatus = async (req, res) => {
        try {
            const userId = req.user.id || req.user.userId;
            const { productId } = req.params;

            const isWishlisted = await this.wishlistUsecase.checkWishlistStatus(userId, productId);

            res.status(200).json({
                success: true,
                isWishlisted
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    clearWishlist = async (req, res) => {
        try {
            const userId = req.user.id || req.user.userId;

            const wishlist = await this.wishlistUsecase.clearWishlist(userId);

            res.status(200).json({
                success: true,
                message: 'Wishlist cleared',
                data: wishlist
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
}

export default WishlistController;