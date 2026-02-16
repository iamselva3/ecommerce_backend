import express from 'express';
import AddressController from '../controller/addressessController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const addressController = new AddressController();

// All routes require authentication
router.use(authMiddleware);

// Address routes
router.post('/', addressController.addAddress);
router.get('/', addressController.getAddresses);
router.get('/:id', addressController.getAddressById);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;