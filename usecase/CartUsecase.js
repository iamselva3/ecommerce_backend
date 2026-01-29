class CartUseCase {
    constructor(cartRepository) {
        this.cartRepository = cartRepository;
    }

    async addItem(userId, product) {
        let cart = await this.cartRepository.findByUserId(userId);

        if (!cart) {
            cart = await this.cartRepository.create({
                userId,
                items: [],
            });
        }

        const existing = cart.items.find(
            (item) => item.productId.toString() === product.productId
        );

        if (existing) {
            existing.qty += 1;
        } else {
            cart.items.push(product);
        }

        return this.cartRepository.save(cart);
    }

    async updateQty(userId, productId, qty) {
        const cart = await this.cartRepository.findByUserId(userId);
        const item = cart.items.find(
            (i) => i.productId.toString() === productId
        );

        item.qty = qty;
        return this.cartRepository.save(cart);
    }

    async removeItem(userId, productId) {
        const cart = await this.cartRepository.findByUserId(userId);
        cart.items = cart.items.filter(
            (i) => i.productId.toString() !== productId
        );

        return this.cartRepository.save(cart);
    }

    async getCart(userId) {
        return this.cartRepository.findByUserId(userId);
    }

    async clearCart(userId) {
        return this.cartRepository.deleteByUserId(userId);
    }
}

export default CartUseCase;
