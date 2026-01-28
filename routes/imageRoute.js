import express from 'express';
import ImageController from '../controller/imageController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware.js';
import { upload } from '../services/imageService.js';

const router = express.Router();
const imageController = new ImageController();



router.post(
    '/upload/:category',
    authMiddleware,
    adminMiddleware,
    upload.single('image'),
    imageController.uploadImage
);

router.post(
    '/upload-multiple/:category',
    authMiddleware,
    adminMiddleware,
    upload.array('images', 10),
    imageController.uploadMultipleImages
);

router.delete(
    '/category/:category',
    authMiddleware,
    adminMiddleware,
    imageController.deleteImagesByCategory
);

router.put(
    '/sort-order',
    authMiddleware,
    adminMiddleware,
    imageController.updateSortOrder
);


router.put(
    '/:id/toggle-featured',
    authMiddleware,
    adminMiddleware,
    imageController.toggleFeatured
);



router.put(
    '/:id',
    authMiddleware,
    imageController.updateImage
);


router.delete(
    '/:id',
    authMiddleware,
    imageController.deleteImage
);

router.get('/category/:category', imageController.getImagesByCategory);


router.get('/search', imageController.searchImages);


router.get('/:id', imageController.getImageById);

router.get('/featured/images', imageController.getFeaturedImages);


router.get('/tags/images', imageController.getImagesByTags);

router.get('/latest/images', imageController.getLatestImages);

router.get('/categories/list', imageController.getAllCategories);

router.get(
    '/stats/images',
    authMiddleware,
    adminMiddleware,
    imageController.getImageStats
);




export default router;