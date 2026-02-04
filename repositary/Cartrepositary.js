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
}

export default CartRepository;
