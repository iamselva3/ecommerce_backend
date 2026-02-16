import AddressUseCase from '../usecase/AddressesUsecase.js';

class AddressController {
    constructor() {
        this.addressUseCase = new AddressUseCase();
    }

    addAddress = async (req, res) => {
        try {

            console.log("✅ Controller hit!"); // Add this to confirm
            console.log("User from token:", req.user);
            const userId = req.user.userId;
            const addressData = req.body;

            const address = await this.addressUseCase.addAddress(userId, addressData);

            return res.status(201).json({
                success: true,
                message: 'Address added successfully',
                data: address
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    getAddresses = async (req, res) => {
        try {
            const userId = req.user.userId;
            const addresses = await this.addressUseCase.getUserAddresses(userId);

            return res.status(200).json({
                success: true,
                data: addresses
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    getAddressById = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // You can implement this if needed
            return res.status(200).json({
                success: true,
                message: 'Endpoint not fully implemented'
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    updateAddress = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const updateData = req.body;

            const updatedAddress = await this.addressUseCase.updateAddress(id, userId, updateData);

            return res.status(200).json({
                success: true,
                message: 'Address updated successfully',
                data: updatedAddress
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    deleteAddress = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const result = await this.addressUseCase.deleteAddress(id, userId);

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

    setDefaultAddress = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const address = await this.addressUseCase.setDefaultAddress(userId, id);

            return res.status(200).json({
                success: true,
                message: 'Default address updated successfully',
                data: address
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
}

export default AddressController;