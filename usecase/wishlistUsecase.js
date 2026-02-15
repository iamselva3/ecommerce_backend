import WishlistRepository from '../repositary/wishlistRepositary.js';

class WishlistUsecase {
    constructor() {
        this.wishlistRepository = new WishlistRepository();
    }

    async getWishlist(userId) {
        return await this.wishlistRepository.getWishlistByUser(userId);
    }

    async addToWishlist(userId, productId) {
        return await this.wishlistRepository.addItem(userId, productId);
    }

    async removeFromWishlist(userId, productId) {
        return await this.wishlistRepository.removeItem(userId, productId);
    }

    async checkWishlistStatus(userId, productId) {
        return await this.wishlistRepository.checkInWishlist(userId, productId);
    }

    async clearWishlist(userId) {
        return await this.wishlistRepository.clearWishlist(userId);
    }

    async getWishlistCount(userId) {
        return await this.wishlistRepository.getWishlistCount(userId);
    }
}

export default WishlistUsecase;