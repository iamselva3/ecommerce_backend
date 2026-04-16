import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import userRoutes from './routes/userroutes.js';
import imageRoutes from './routes/imageRoute.js';
import cartRoutes from './routes/CartRoute.js';
import orderRoutes from './routes/OrderRoutes.js';
import reviewRoutes from './routes/reviewRoute.js';
import wishlistRoutes from './routes/wishlistRoute.js';
import AddressRoutes from './routes/AddressesRoute.js';
import PaymentMethodRoutes from './routes/PaymentRoute.js';
import PincodeRoutes from './routes/PincodeRoute.js';
import authRoutes from './routes/authRouts.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import AiRoutes from './routes/AiRoutes.js';


dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running with MongoDB');
    console.log("Server is running with MongoDB")
});

app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', AddressRoutes);
app.use('/api/payment-methods', PaymentMethodRoutes);
app.use('/api/pincode', PincodeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', AiRoutes);
import paymentGatewayRoutes from './routes/PaymentRoutes.js';
app.use('/api/payment', paymentGatewayRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});