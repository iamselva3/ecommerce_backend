import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import userRoutes from './routes/userroutes.js';
import imageRoutes from './routes/imageRoute.js';
import cartRoutes from './routes/CartRoute.js';
import orderRoutes from './routes/OrderRoutes.js';
import reviewRoutes from './routes/reviewRoute.js';
import cors from 'cors';


dotenv.config();

const app = express();
app.use(express.json());
// app.use(cors());


// app.use(
//     cors({
//         origin: process.env.FRONTEND_URL,
//         credentials: true,
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running with MongoDB');
});

app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});