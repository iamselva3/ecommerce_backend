import PaymentMethodUseCase from '../usecase/PaymentUsecase.js';

class PaymentMethodController {
    constructor() {
        this.paymentMethodUseCase = new PaymentMethodUseCase();
    }

    addPaymentMethod = async (req, res) => {
        try {
            const userId = req.user.userId;
            const paymentData = req.body;

            const paymentMethod = await this.paymentMethodUseCase.addPaymentMethod(userId, paymentData);

            return res.status(201).json({
                success: true,
                message: 'Payment method added successfully',
                data: paymentMethod
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    getPaymentMethods = async (req, res) => {
        try {
            const userId = req.user.userId;
            const paymentMethods = await this.paymentMethodUseCase.getUserPaymentMethods(userId);

            return res.status(200).json({
                success: true,
                data: paymentMethods
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    updatePaymentMethod = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const updateData = req.body;

            const updatedMethod = await this.paymentMethodUseCase.updatePaymentMethod(id, userId, updateData);

            return res.status(200).json({
                success: true,
                message: 'Payment method updated successfully',
                data: updatedMethod
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    deletePaymentMethod = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const result = await this.paymentMethodUseCase.deletePaymentMethod(id, userId);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    setDefaultPaymentMethod = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const paymentMethod = await this.paymentMethodUseCase.setDefaultPaymentMethod(userId, id);

            return res.status(200).json({
                success: true,
                message: 'Default payment method updated successfully',
                data: paymentMethod
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
}

export default PaymentMethodController;