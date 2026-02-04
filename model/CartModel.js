import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Image", // later replace with Product
    },
    name: String,
    price: Number,
    sizes: {
        type: [String],
        required: true,
        enum: ['s', 'm', 'l', 'xl', 'xxl'],
    },
    image: String,
    qty: {
        type: Number,
        default: 1,
    },
});

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        items: [cartItemSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
