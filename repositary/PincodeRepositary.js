import Pincode from '../model/PincodeModel.js';

class PincodeRepository {
    async findByPincode(pincode) {
        try {
            return await Pincode.findOne({ pincode: pincode.toString().trim() });
        } catch (error) {
            throw new Error(`Error finding pincode: ${error.message}`);
        }
    }

    async findNearbyPincodes(city, district) {
        try {
            return await Pincode.find({
                $or: [
                    { city: { $regex: city, $options: 'i' } },
                    { district: { $regex: district, $options: 'i' } }
                ],
                isDeliverable: true
            }).limit(5);
        } catch (error) {
            throw new Error(`Error finding nearby pincodes: ${error.message}`);
        }
    }

    async create(pincodeData) {
        try {
            const pincode = new Pincode(pincodeData);
            return await pincode.save();
        } catch (error) {
            throw new Error(`Error creating pincode: ${error.message}`);
        }
    }

    async update(pincode, updateData) {
        try {
            updateData.lastUpdated = Date.now();
            return await Pincode.findOneAndUpdate(
                { pincode },
                updateData,
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating pincode: ${error.message}`);
        }
    }

    async updateDeliverability(pincode, isDeliverable) {
        try {
            return await Pincode.findOneAndUpdate(
                { pincode },
                { isDeliverable, lastUpdated: Date.now() },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating deliverability: ${error.message}`);
        }
    }

    async update(pincode, updateData) {
        try {
            updateData.lastUpdated = Date.now();
            return await Pincode.findOneAndUpdate(
                { pincode },
                updateData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error(`Error updating pincode: ${error.message}`);
        }
    }

    async getAllDeliverablePincodes(page = 1, limit = null) {
        try {
            const query = {};
            let pincodes;
            let total;

            if (limit) {
                // With pagination
                const skip = (page - 1) * limit;
                pincodes = await Pincode.find(query)
                    .skip(skip)
                    .limit(limit)
                    .sort({ pincode: 1 });
                total = await Pincode.countDocuments(query);
            } else {
                
                pincodes = await Pincode.find(query).sort({ pincode: 1 });
                total = pincodes.length;
            }

            return {
                pincodes,
                pagination: limit ? {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                } : null
            };
        } catch (error) {
            throw new Error(`Error fetching pincodes: ${error.message}`);
        }
    }

    async bulkCreate(pincodesArray) {
        try {
            return await Pincode.insertMany(pincodesArray, { ordered: false });
        } catch (error) {
            throw new Error(`Error bulk creating pincodes: ${error.message}`);
        }
    }

    async delete(pincode) {
        try {
            return await Pincode.findOneAndDelete({ pincode });
        } catch (error) {
            throw new Error(`Error deleting pincode: ${error.message}`);
        }
    }
}

export default PincodeRepository;