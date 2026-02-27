import CartRepository from "../repositary/Cartrepositary.js";
import CartUseCase from "../usecase/CartUsecase.js";

const cartUseCase = new CartUseCase(new CartRepository());

class CartController {
    async addToCart(req, res) {
        console.log(req.body)
        const userId = req.user.userId;
        const cart = await cartUseCase.addItem(userId, req.body);
        res.json(cart);
    }

    async getCart(req, res) {
        const cart = await cartUseCase.getCart(req.user.userId);
        res.json(cart);
    }

    async updateQty(req, res) {
        const { productId, qty } = req.body;
        const cart = await cartUseCase.updateQty(
            req.user.userId,
            productId,
            qty
        );
        res.json(cart);
    }

    async removeItem(req, res) {
        const { productId } = req.params;
        const cart = await cartUseCase.removeItem(req.user.userId, productId);
        res.json(cart);
    }

    async clearCart(req, res) {
        const updatedCart = await cartUseCase.clearCart(req.user.userId);
       

        
        res.json({
            success: true,
            data: updatedCart || { items: [] }
        });
    }

    async getCartCount(req, res) {
        const userId = req.user.userId;
        const count = await cartUseCase.getCartCount(userId);
        res.json(count);
    }
}




export default new CartController();
