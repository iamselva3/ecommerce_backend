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
}

export default CartRepository;
