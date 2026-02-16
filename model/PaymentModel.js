import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['card', 'upi', 'netbanking'],
        required: true
    },
    cardDetails: {
        last4: String,
        brand: String,
        expiryMonth: String,
        expiryYear: String,
        cardHolderName: String,
        token: String
    },
    upiDetails: {
        upiId: String,
        vpa: String
    },
    netbankingDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function () {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
