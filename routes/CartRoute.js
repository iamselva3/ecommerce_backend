import express from "express";
import cartController from "../controller/Cartcontroller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", cartController.addToCart);
router.get("/", cartController.getCart);
router.put("/", cartController.updateQty);
router.delete("/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);
router.get("/count", cartController.getCartCount);

export default router;
