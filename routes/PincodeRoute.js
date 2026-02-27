import express from 'express';
import PincodeController from '../controller/pincodeController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const pincodeController = new PincodeController();

router.get('/check/:pincode', pincodeController.checkPincode);
router.get('/location', pincodeController.checkByCoordinates);

// Admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/admin/all', pincodeController.getAllPincodes);
router.post('/admin/add', pincodeController.addPincode);
router.put('/admin/:pincode/deliverability', pincodeController.updateDeliverability);
router.post('/admin/bulk-upload', pincodeController.bulkUploadPincodes);
router.put('/admin/:pincode', pincodeController.updatePincode);

export default router;