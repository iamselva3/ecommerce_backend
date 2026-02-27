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
        const existingCart = await Cart.findOne({ userId: userId });
        
        if (!existingCart) {
            console.log(`No cart found for user: ${userId}`);
            return { items: [] };
        }

        // Clear the items array
        existingCart.items = [];
        existingCart.updatedAt = new Date();

        // Save and return the updated cart
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
