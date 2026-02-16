import PaymentMethod from '../model/PaymentModel.js';

class PaymentMethodRepository {
    async create(paymentData) {
        try {
            const paymentMethod = new PaymentMethod(paymentData);
            return await paymentMethod.save();
        } catch (error) {
            throw new Error(`Error creating payment method: ${error.message}`);
        }
    }

    async findByUser(userId) {
        try {
            return await PaymentMethod.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching payment methods: ${error.message}`);
        }
    }

    async findById(id) {
        try {
            return await PaymentMethod.findById(id);
        } catch (error) {
            throw new Error(`Error finding payment method: ${error.message}`);
        }
    }

    async findDefaultByUser(userId) {
        try {
            return await PaymentMethod.findOne({ user: userId, isDefault: true });
        } catch (error) {
            throw new Error(`Error finding default payment method: ${error.message}`);
        }
    }

    async update(id, updateData) {
        try {
            updateData.updatedAt = Date.now();
            return await PaymentMethod.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error(`Error updating payment method: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            return await PaymentMethod.findByIdAndDelete(id);
        } catch (error) {
            throw new Error(`Error deleting payment method: ${error.message}`);
        }
    }

    async setDefault(userId, paymentId) {
        try {
            // Remove default from all other payment methods
            await PaymentMethod.updateMany(
                { user: userId, _id: { $ne: paymentId } },
                { isDefault: false }
            );

            // Set this payment method as default
            return await PaymentMethod.findByIdAndUpdate(
                paymentId,
                { isDefault: true, updatedAt: Date.now() },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error setting default payment method: ${error.message}`);
        }
    }
}

export default PaymentMethodRepository;