import Cart from "../model/CartModel.js";

class CartRepository {
    findByUserId(userId) {
        return Cart.findOne({ userId });
    }

    create(cart) {
        return Cart.create(cart);
    }

    save(cart) {
        return cart.save();
    }

    deleteByUserId(userId) {
        return Cart.deleteOne({ userId });
    }
    async clearCart(userId) {
        try {
            console.log(`Clearing cart for user: ${userId}`);

            // Find existing cart
            const existingCart = await Cart.findOne({ user: userId });

            if (!existingCart) {
                console.log(`No cart found for user: ${userId}, nothing to clear`);
                return null;
            }

            // Update the existing cart to empty items
            existingCart.items = [];
            existingCart.updatedAt = new Date();

            // Save the updated cart
            const updatedCart = await existingCart.save();

            console.log(`Cart cleared for user: ${userId}`);
            return updatedCart;
        } catch (error) {
            console.error('Error in clearCart:', error);
            throw error;
        }
    }

    async getCartCount(userId) {
        try {
            const cart = await Cart.findOne({ userId: userId });
            
            if (!cart || !cart.items || cart.items.length === 0) {
                return 0;
            }
            
            // Sum up all quantities
            return cart.items.reduce((sum, item) => sum + (item.qty || 1), 0);
        } catch (error) {
            console.error('Get cart count error:', error);
            throw error;
        }
    }
}

export default CartRepository;
