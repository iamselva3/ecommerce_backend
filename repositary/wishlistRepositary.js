import Wishlist from '../model/wishlistModel.js';

class WishlistRepository {
    async getWishlistByUser(userId) {
        let wishlist = await Wishlist.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name price images category description'
            });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: userId, items: [] });
        }

        return wishlist;
    }

    async addItem(userId, productId) {
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            {
                $addToSet: { items: { product: productId } } // $addToSet prevents duplicates
            },
            { new: true, upsert: true }
        ).populate('items.product');

        return wishlist;
    }

    async removeItem(userId, productId) {
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            {
                $pull: { items: { product: productId } }
            },
            { new: true }
        ).populate('items.product');

        return wishlist;
    }

    async checkInWishlist(userId, productId) {
        const wishlist = await Wishlist.findOne({
            user: userId,
            'items.product': productId
        });

        return !!wishlist;
    }

    async clearWishlist(userId) {
        return await Wishlist.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true }
        );
    }

    async getWishlistCount(userId) {
        const wishlist = await Wishlist.findOne({ user: userId });
        return wishlist ? wishlist.items.length : 0;
    }
}

export default WishlistRepository;