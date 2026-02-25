import PincodeUseCase from '../usecase/PincodeUsecase.js';

class PincodeController {
    constructor() {
        this.pincodeUseCase = new PincodeUseCase();
    }

    checkPincode = async (req, res) => {
        try {
            const { pincode } = req.params;
            

            const result = await this.pincodeUseCase.checkPincode(pincode);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Check pincode error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    checkByCoordinates = async (req, res) => {
        try {
            const { lat, lng } = req.query;

            const result = await this.pincodeUseCase.checkByCoordinates(lat, lng);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Check coordinates error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    updateDeliverability = async (req, res) => {
        try {
            const { pincode } = req.params;
            const { isDeliverable } = req.body;
            const userId = req.user._id;

            const result = await this.pincodeUseCase.updateDeliverability(pincode, isDeliverable, userId);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Update deliverability error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    addPincode = async (req, res) => {
        try {
            const userId = req.user._id;

            const result = await this.pincodeUseCase.addPincode(req.body, userId);

            if (result.success) {
                return res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Add pincode error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    getAllPincodes = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;

            const result = await this.pincodeUseCase.getAllPincodes(page, limit);

            return res.status(200).json({
                success: true,
                data: result.data
            });
        } catch (error) {
            console.error('Get pincodes error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };

    bulkUploadPincodes = async (req, res) => {
        try {
            const userId = req.user._id;
            const { pincodes } = req.body;

            if (!pincodes || !Array.isArray(pincodes)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide an array of pincodes'
                });
            }

            const result = await this.pincodeUseCase.bulkUploadPincodes(pincodes, userId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            console.error('Bulk upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };
}

export default PincodeController;