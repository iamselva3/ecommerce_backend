import Address from '../model/addressesModel.js';

class AddressRepository {
  async create(addressData) {
    try {
      
      const address = new Address(addressData);
      return await address.save();
    } catch (error) {
      throw new Error(`Error creating address: ${error.message}`);
    }
  }

  async findByUser(userId) {
    try {
      return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    } catch (error) {
      throw new Error(`Error fetching addresses: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Address.findById(id);
    } catch (error) {
      throw new Error(`Error finding address: ${error.message}`);
    }
  }

  async findDefaultByUser(userId) {
    try {
      return await Address.findOne({ user: userId, isDefault: true });
    } catch (error) {
      throw new Error(`Error finding default address: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      updateData.updatedAt = Date.now();
      return await Address.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new Error(`Error updating address: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      return await Address.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting address: ${error.message}`);
    }
  }

  async setDefault(userId, addressId) {
    try {
      // Remove default from all other addresses
      await Address.updateMany(
        { user: userId, _id: { $ne: addressId } },
        { isDefault: false }
      );

      // Set this address as default
      return await Address.findByIdAndUpdate(
        addressId,
        { isDefault: true, updatedAt: Date.now() },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error setting default address: ${error.message}`);
    }
  }
}

export default AddressRepository;