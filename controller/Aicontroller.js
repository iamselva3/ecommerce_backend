import { CohereClient } from 'cohere-ai';

// Initialize the client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

class AIController {
    // Chat with AI
    chat = async (req, res) => {
        try {
            const { message, history } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            // Build conversation history as a string
            let conversationHistory = '';
            if (history && history.length > 0) {
                conversationHistory = history.map(msg =>
                    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                ).join('\n') + '\n';
            }

            // Create a single message with context
            const fullMessage = `You are a helpful AI shopping assistant for an e-commerce store called "Namm Cart". 
You help customers with product recommendations, order tracking, size advice, returns, discounts, and shipping.
Keep responses friendly, concise, and helpful under 100 words.
Current date: ${new Date().toLocaleDateString()}

${conversationHistory}User: ${message}`;

           
            const response = await cohere.chat({
                model: 'command-a-03-2025', // This is the latest flagship model
                message: fullMessage,
                temperature: 0.8,
                max_tokens: 300,
            });

            return res.status(200).json({
                success: true,
                response: response.text
            });

        } catch (error) {
            console.error('AI chat error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get AI response',
                error: error.message
            });
        }
    };

    // Get product recommendations
    getRecommendations = async (req, res) => {
        try {
            const { query, category, priceRange } = req.body;

            const message = `You are a product recommendation AI for an e-commerce store.
Suggest 3-5 products based on: ${query || 'popular items'}. 
${category ? `Category: ${category}` : ''}
${priceRange ? `Price range: ${priceRange}` : ''}
Give brief product names and why they might be good choices.`;

            // ✅ Use a LIVE model
            const response = await cohere.chat({
                model: 'command-a-03-2025',
                message: message,
                temperature: 0.7,
                max_tokens: 200,
            });

            return res.status(200).json({
                success: true,
                recommendations: response.text
            });

        } catch (error) {
            console.error('Recommendations error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get recommendations'
            });
        }
    };

    // Answer FAQs
    answerFAQ = async (req, res) => {
        try {
            const { question } = req.body;

            const message = `You are an FAQ assistant for an e-commerce store. Answer questions based on these policies:
- Returns are accepted within 30 days
- Free shipping on orders above ₹999
- Delivery takes 3-5 business days
- Cash on Delivery is available
- Size guides are on product pages

Question: ${question}

Answer:`;

            // ✅ Use a LIVE model
            const response = await cohere.chat({
                model: 'command-a-03-2025',
                message: message,
                temperature: 0.5,
                max_tokens: 150,
            });

            return res.status(200).json({
                success: true,
                answer: response.text
            });

        } catch (error) {
            console.error('FAQ error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get answer'
            });
        }
    };
}

export default AIController;