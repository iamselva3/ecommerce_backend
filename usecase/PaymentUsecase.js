import PaymentMethodRepository from '../repositary/PaymentRepositary.js';

class PaymentMethodUseCase {
    constructor() {
        this.paymentMethodRepository = new PaymentMethodRepository();
    }

    async addPaymentMethod(userId, paymentData) {
        try {
            const paymentMethod = {
                user: userId,
                ...paymentData
            };

            // If this is the first payment method, make it default
            const existingMethods = await this.paymentMethodRepository.findByUser(userId);
            if (existingMethods.length === 0) {
                paymentMethod.isDefault = true;
            }

            // Validate based on type
            if (paymentMethod.type === 'card') {
                if (!paymentMethod.cardDetails || !paymentMethod.cardDetails.last4) {
                    throw new Error('Invalid card details');
                }
                // In production, you would tokenize the card here
            } else if (paymentMethod.type === 'upi') {
                if (!paymentMethod.upiDetails || !paymentMethod.upiDetails.upiId) {
                    throw new Error('Invalid UPI details');
                }
            }

            return await this.paymentMethodRepository.create(paymentMethod);
        } catch (error) {
            throw new Error(`Failed to add payment method: ${error.message}`);
        }
    }

    async getUserPaymentMethods(userId) {
        try {
            return await this.paymentMethodRepository.findByUser(userId);
        } catch (error) {
            throw new Error(`Failed to fetch payment methods: ${error.message}`);
        }
    }

    async updatePaymentMethod(paymentId, userId, updateData) {
        try {
            const paymentMethod = await this.paymentMethodRepository.findById(paymentId);

            if (!paymentMethod) {
                throw new Error('Payment method not found');
            }

            if (paymentMethod.user.toString() !== userId) {
                throw new Error('Unauthorized to update this payment method');
            }

            // If setting as default, handle default logic
            if (updateData.isDefault) {
                await this.paymentMethodRepository.setDefault(userId, paymentId);
                delete updateData.isDefault; // Already handled
            }

            return await this.paymentMethodRepository.update(paymentId, updateData);
        } catch (error) {
            throw new Error(`Failed to update payment method: ${error.message}`);
        }
    }

    async deletePaymentMethod(paymentId, userId) {
        try {
            const paymentMethod = await this.paymentMethodRepository.findById(paymentId);

            if (!paymentMethod) {
                throw new Error('Payment method not found');
            }

            if (paymentMethod.user.toString() !== userId) {
                throw new Error('Unauthorized to delete this payment method');
            }

            await this.paymentMethodRepository.delete(paymentId);

            // If deleted method was default, set another method as default
            if (paymentMethod.isDefault) {
                const remainingMethods = await this.paymentMethodRepository.findByUser(userId);
                if (remainingMethods.length > 0) {
                    await this.paymentMethodRepository.setDefault(userId, remainingMethods[0]._id);
                }
            }

            return { success: true, message: 'Payment method deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete payment method: ${error.message}`);
        }
    }

    async setDefaultPaymentMethod(userId, paymentId) {
        try {
            const paymentMethod = await this.paymentMethodRepository.findById(paymentId);

            if (!paymentMethod) {
                throw new Error('Payment method not found');
            }

            if (paymentMethod.user.toString() !== userId) {
                throw new Error('Unauthorized to set this payment method as default');
            }

            return await this.paymentMethodRepository.setDefault(userId, paymentId);
        } catch (error) {
            throw new Error(`Failed to set default payment method: ${error.message}`);
        }
    }
}

export default PaymentMethodUseCase;