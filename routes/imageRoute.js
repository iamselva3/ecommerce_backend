import express from 'express';
import ImageController from '../controller/imageController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../services/imageService.js';

const router = express.Router();
const imageController = new ImageController();


// Single image upload
router.post(
    '/upload/:category',
    authMiddleware,
    adminMiddleware,
    upload.single('image'),
    imageController.uploadImage
);

// Multiple images upload
router.post(
    '/upload-multiple/:category',
    authMiddleware,
    adminMiddleware,
    upload.array('images', 10),
    imageController.uploadMultipleImages
);

// Delete all images in category
router.delete(
    '/category/:category',
    authMiddleware,
    adminMiddleware,
    imageController.deleteImagesByCategory
);

// Update sort order
router.put(
    '/sort-order',
    authMiddleware,
    adminMiddleware,
    imageController.updateSortOrder
);

// Toggle featured status
router.put(
    '/:id/toggle-featured',
    authMiddleware,
    adminMiddleware,
    imageController.toggleFeatured
);


// Update image metadata
router.put(
    '/:id',
    authMiddleware,
    imageController.updateImage
);

// Delete single image
router.delete(
    '/:id',
    authMiddleware,
    imageController.deleteImage
);

// Get images by category
router.get('/category/:category', imageController.getImagesByCategory);

// Search images
router.get('/search', imageController.searchImages);

// Get single image by ID
router.get('/:id', imageController.getImageById);

// Get featured images
router.get('/featured/images', imageController.getFeaturedImages);

// Get images by tags
router.get('/tags/images', imageController.getImagesByTags);

// Get latest images
router.get('/latest/images', imageController.getLatestImages);


router.get(
    '/stats/images',
    authMiddleware,
    adminMiddleware,
    imageController.getImageStats
);




export default router;