import express from 'express';
import AIController from '../controller/Aicontroller.js';

const router = express.Router();
const aiController = new AIController();

// AI Chat endpoint
router.post('/chat', aiController.chat);

// Get product recommendations
router.post('/recommendations', aiController.getRecommendations);

// Answer FAQs
router.post('/faq', aiController.answerFAQ);

export default router;