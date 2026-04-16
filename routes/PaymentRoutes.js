import express from 'express';
import Razorpay from 'razorpay';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/razorpay', authMiddleware, async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.API_KEY,
      key_secret: process.env.SECRET_KEY,
    });

    const options = {
      amount: req.body.amount * 100, // amount in paise
      currency: 'INR',
      receipt: 'receipt_order_' + Date.now(),
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send('Some error occured');
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get('/get-razorpay-key', authMiddleware, (req, res) => {
  res.json({ key: process.env.API_KEY });
});

export default router;
