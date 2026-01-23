import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import userRoutes from './routes/userroutes.js';
import imageRoutes from './routes/imageRoute.js';

dotenv.config();

const app = express();
app.use(express.json());


connectDB();

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running with MongoDB');
});

app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});