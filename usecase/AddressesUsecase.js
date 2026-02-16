import AddressRepository from '../repositary/AddressessRepositary.js';

class AddressUseCase {
    constructor() {
        this.addressRepository = new AddressRepository();
    }

    async addAddress(userId, addressData) {
        try {
            const address = {
                user: userId,
                ...addressData
            };

            // If this is the first address, make it default
            const existingAddresses = await this.addressRepository.findByUser(userId);
            if (existingAddresses.length === 0) {
                address.isDefault = true;
            }

            return await this.addressRepository.create(address);
        } catch (error) {
            throw new Error(`Failed to add address: ${error.message}`);
        }
    }

    async getUserAddresses(userId) {
        try {
            return await this.addressRepository.findByUser(userId);
        } catch (error) {
            throw new Error(`Failed to fetch addresses: ${error.message}`);
        }
    }

    async updateAddress(addressId, userId, updateData) {
        try {
            const address = await this.addressRepository.findById(addressId);

            if (!address) {
                throw new Error('Address not found');
            }

            if (address.user.toString() !== userId) {
                throw new Error('Unauthorized to update this address');
            }

            // If setting as default, handle default logic
            if (updateData.isDefault) {
                await this.addressRepository.setDefault(userId, addressId);
                delete updateData.isDefault; // Already handled
            }

            return await this.addressRepository.update(addressId, updateData);
        } catch (error) {
            throw new Error(`Failed to update address: ${error.message}`);
        }
    }

    async deleteAddress(addressId, userId) {
        try {
            const address = await this.addressRepository.findById(addressId);

            if (!address) {
                throw new Error('Address not found');
            }

            if (address.user.toString() !== userId) {
                throw new Error('Unauthorized to delete this address');
            }

            await this.addressRepository.delete(addressId);

            // If deleted address was default, set another address as default
            if (address.isDefault) {
                const remainingAddresses = await this.addressRepository.findByUser(userId);
                if (remainingAddresses.length > 0) {
                    await this.addressRepository.setDefault(userId, remainingAddresses[0]._id);
                }
            }

            return { success: true, message: 'Address deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete address: ${error.message}`);
        }
    }

    async setDefaultAddress(userId, addressId) {
        try {
            const address = await this.addressRepository.findById(addressId);

            if (!address) {
                throw new Error('Address not found');
            }

            if (address.user.toString() !== userId) {
                throw new Error('Unauthorized to set this address as default');
            }

            return await this.addressRepository.setDefault(userId, addressId);
        } catch (error) {
            throw new Error(`Failed to set default address: ${error.message}`);
        }
    }
}

export default AddressUseCase;