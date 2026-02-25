import PincodeRepository from '../repositary/PincodeRepositary.js';
import axios from 'axios';

class PincodeUseCase {
    constructor() {
        this.pincodeRepository = new PincodeRepository();
    }

    // Check pincode directly
    async checkPincode(pincode) {
        try {
            if (!pincode || pincode.length !== 6) {
                return {
                    success: false,
                    error: 'Invalid pincode format. Please enter a 6-digit pincode.'
                };
            }

            // First check in our database
            let pincodeData = await this.pincodeRepository.findByPincode(pincode);

            // If not found, try to fetch from external API
            if (!pincodeData) {
                pincodeData = await this.fetchPincodeFromExternalAPI(pincode);

                // Save to our database for future use
                if (pincodeData) {
                    await this.pincodeRepository.create(pincodeData);
                }
            }

            if (!pincodeData) {
                return {
                    success: false,
                    error: 'Pincode not found. Please check and try again.'
                };
            }

            return {
                success: true,
                data: {
                    pincode: pincodeData.pincode,
                    city: pincodeData.city,
                    state: pincodeData.state,
                    district: pincodeData.district,
                    isDeliverable: pincodeData.isDeliverable,
                    deliveryDays: pincodeData.deliveryDays,
                    codAvailable: pincodeData.codAvailable,
                    expressDelivery: pincodeData.expressDelivery,
                    expressDeliveryDays: pincodeData.expressDeliveryDays,
                    pickupStores: pincodeData.pickupStores || []
                }
            };
        } catch (error) {
            throw new Error(`Error checking pincode: ${error.message}`);
        }
    }

    // Check via coordinates (latitude, longitude)
    async checkByCoordinates(lat, lng) {
        try {
            if (!lat || !lng) {
                return {
                    success: false,
                    error: 'Latitude and longitude are required'
                };
            }

            // Reverse geocode to get pincode
            const pincode = await this.reverseGeocode(lat, lng);

            if (!pincode) {
                return {
                    success: false,
                    error: 'Could not determine your location. Please enter pincode manually.'
                };
            }

            // Now check the pincode
            return await this.checkPincode(pincode);
        } catch (error) {
            throw new Error(`Error checking by coordinates: ${error.message}`);
        }
    }

    // Reverse geocoding using OpenStreetMap/Nominatim (free)
    async reverseGeocode(lat, lng) {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'YourAppName/1.0'
                    }
                }
            );

            if (response.data && response.data.address) {
                const address = response.data.address;
                return address.postcode || null;
            }
            return null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }

    // Fetch pincode details from external API (example using PostPIN API)
    async fetchPincodeFromExternalAPI(pincode) {
        try {
            // You can use any free pincode API like:
            // - PostPIN (https://postpin.codeforgov.in/)
            // - India Post API
            // - Google Maps API (paid)

            const response = await axios.get(
                `https://api.postalpincode.in/pincode/${pincode}`
            );

            if (response.data && response.data[0] && response.data[0].Status === 'Success') {
                const data = response.data[0].PostOffice[0];

                return {
                    pincode: pincode,
                    city: data.Block || data.District,
                    state: data.State,
                    district: data.District,
                    country: data.Country,
                    isDeliverable: true, // Default to true, can be overridden by admin
                    deliveryDays: 3,
                    codAvailable: true,
                    expressDelivery: false,
                    expressDeliveryDays: 1
                };
            }
            return null;
        } catch (error) {
            console.error('External API error:', error);
            return null;
        }
    }

    // Admin functions
    async updateDeliverability(pincode, isDeliverable, userId) {
        try {
            const updated = await this.pincodeRepository.updateDeliverability(
                pincode,
                isDeliverable
            );

            if (!updated) {
                return {
                    success: false,
                    error: 'Pincode not found'
                };
            }

            return {
                success: true,
                message: `Pincode ${pincode} marked as ${isDeliverable ? 'deliverable' : 'non-deliverable'}`,
                data: updated
            };
        } catch (error) {
            throw new Error(`Error updating deliverability: ${error.message}`);
        }
    }

    async addPincode(pincodeData, userId) {
        try {
            // Check if already exists
            const existing = await this.pincodeRepository.findByPincode(pincodeData.pincode);

            if (existing) {
                return {
                    success: false,
                    error: 'Pincode already exists'
                };
            }

            pincodeData.updatedBy = userId;
            const newPincode = await this.pincodeRepository.create(pincodeData);

            return {
                success: true,
                message: 'Pincode added successfully',
                data: newPincode
            };
        } catch (error) {
            throw new Error(`Error adding pincode: ${error.message}`);
        }
    }

    async getAllPincodes(page = 1, limit = 50) {
        try {
            const result = await this.pincodeRepository.getAllDeliverablePincodes(page, limit);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            throw new Error(`Error fetching pincodes: ${error.message}`);
        }
    }

    async bulkUploadPincodes(pincodesArray, userId) {
        try {
            const formattedPincodes = pincodesArray.map(p => ({
                ...p,
                updatedBy: userId,
                lastUpdated: Date.now()
            }));

            const result = await this.pincodeRepository.bulkCreate(formattedPincodes);

            return {
                success: true,
                message: `${result.length} pincodes uploaded successfully`,
                data: {
                    uploaded: result.length,
                    failed: pincodesArray.length - result.length
                }
            };
        } catch (error) {
            throw new Error(`Error bulk uploading pincodes: ${error.message}`);
        }
    }
}

export default PincodeUseCase;