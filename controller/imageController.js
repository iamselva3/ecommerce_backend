import ImageUsecase from '../usecase/imageUsecase.js';
import { handleMulterError, upload } from '../services/imageService.js';

class ImageController {
    constructor() {
        this.imageUsecase = new ImageUsecase();
    }

    uploadImage = [
        // upload.single('image'),
        handleMulterError,
        async (req, res) => {
            console.log(req.file);

            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No file uploaded'
                    });
                }

                const category = req.params.category || 'general';
                const userId = req.user?.userId;

                let sizes = [];

                try {
                    sizes = JSON.parse(req.body.sizes);
                } catch (err) {
                    return res.status(400).json({ message: "Invalid sizes format" });
                }

                const metadata = {
                    name: req.body.name || req.file.originalname.split('.')[0],
                    altText: req.body.altText || '',
                    sizes: sizes,
                    price: req.body.price || 0,
                    tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
                    isFeatured: req.body.isFeatured === 'true',
                    description: req.body.description || '',
                    subCategory: req.body.subCategory || null,
                    sortOrder: req.body.sortOrder || 0
                };

                // Use usecase to handle the upload
                const result = await this.imageUsecase.uploadImage(
                    req.file,
                    category,
                    userId,
                    metadata
                );

                if (result.success) {
                    res.status(201).json({
                        success: true,
                        message: 'Image uploaded successfully',
                        data: result.data
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                }
            } catch (error) {
                console.error('Controller Upload Error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Server error',
                    error: error.message
                });
            }
        }
    ];

    uploadMultipleImages = [
        // upload.array('images', 10),
        handleMulterError,
        async (req, res) => {
            try {
                if (!req.files || req.files.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'No files uploaded'
                    });
                }

                const category = req.params.category || 'general';
                const userId = req.user?.userId;

                // Parse metadata array
                let metadataArray = [];
                try {
                    if (req.body.images) {
                        metadataArray = JSON.parse(req.body.images);
                    }
                } catch (e) {
                    metadataArray = [];
                }

                const result = await this.imageUsecase.uploadMultipleImages(
                    req.files,
                    category,
                    userId,
                    metadataArray
                );

                if (result.success) {
                    res.status(201).json({
                        success: true,
                        message: 'Upload completed successfully',
                        data: result.data
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                }
            } catch (error) {
                console.error('Controller Multiple Upload Error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Server error',
                    error: error.message
                });
            }
        }
    ];


    getImagesByCategory = async (req, res) => {
        try {
            const { category } = req.params;
            const {
                page = 1,
                limit = 20,
                subCategory,
                tags,
                featured,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                subCategory,
                tags: tags ? tags.split(',') : undefined,
                featured: featured !== undefined ? featured === 'true' : undefined,
                sortBy,
                sortOrder
            };

            const result = await this.imageUsecase.getImagesByCategory(category, options);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Images retrieved successfully',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Get Images Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    getImageById = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.imageUsecase.getImageById(id);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Image retrieved successfully',
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Get Image Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    updateImage = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const userRole = req.user?.role;

            console.log("req.body", req.body)

            if (req.body.sizes !== undefined) {
                // Case 1: multipart/form-data → string
                if (typeof req.body.sizes === "string") {
                    try {
                        req.body.sizes = JSON.parse(req.body.sizes);
                    } catch {
                        return res.status(400).json({ message: "Invalid sizes format" });
                    }
                }

                // Case 2: must be an array
                if (!Array.isArray(req.body.sizes)) {
                    return res.status(400).json({ message: "Sizes must be an array" });
                }
            }


            const result = await this.imageUsecase.updateImage(
                id,
                req.body,
                userId,
                userRole
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Image updated successfully',
                    data: result.data
                });
            } else {
                res.status(result.error === 'Unauthorized to update this image' ? 403 : 400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Update Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    deleteImage = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const userRole = req.user?.role;

            const result = await this.imageUsecase.deleteImage(id, userId, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message || 'Image deleted successfully'
                });
            } else {
                res.status(result.error === 'Unauthorized to delete this image' ? 403 : 400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Delete Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    deleteImagesByCategory = async (req, res) => {
        try {
            const { category } = req.params;
            const userRole = req.user?.role;

            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const result = await this.imageUsecase.deleteImagesByCategory(category, req.user?.userId, userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Delete Category Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    searchImages = async (req, res) => {
        try {
            const { q, category, page = 1, limit = 20 } = req.query;

            const result = await this.imageUsecase.searchImages(q, { category, page, limit });

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Search completed',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Search Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    updateSortOrder = async (req, res) => {
        try {
            const userRole = req.user?.role;

            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const result = await this.imageUsecase.updateSortOrder(
                req.body.images,
                req.user?.userId,
                userRole
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Sort Order Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    toggleFeatured = async (req, res) => {
        try {
            const { id } = req.params;
            const userRole = req.user?.role;

            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            const result = await this.imageUsecase.toggleFeatured(
                id,
                req.user?.userId,
                userRole
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Toggle Featured Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    getFeaturedImages = async (req, res) => {
        try {
            const { category, limit = 10 } = req.query;

            const result = await this.imageUsecase.getFeaturedImages(category, parseInt(limit));

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Featured images retrieved',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Get Featured Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    getImageStats = async (req, res) => {
        try {
            const userRole = req.user?.role;

            const result = await this.imageUsecase.getImageStats(userRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Statistics retrieved',
                    data: result.data
                });
            } else {
                res.status(403).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Get Stats Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    getImagesByTags = async (req, res) => {
        try {
            const { tags, page = 1, limit = 20 } = req.query;

            if (!tags) {
                return res.status(400).json({
                    success: false,
                    message: 'Tags parameter is required'
                });
            }

            const tagArray = tags.split(',');
            const result = await this.imageUsecase.getImagesByTags(tagArray, { page, limit });

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Images retrieved by tags',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Get by Tags Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    getLatestImages = async (req, res) => {
        try {
            const { limit = 10 } = req.query;

            const result = await this.imageUsecase.getLatestImages(parseInt(limit));

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Latest images retrieved',
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Controller Get Latest Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };


    testUpload = [
        upload.single('image'),
        async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No file uploaded'
                    });
                }

                const category = req.params.category || 'general';

                // Use a test user ID for testing
                const testUserId = 'test-user-id';

                const metadata = {
                    name: req.body.name || 'Test Image',
                    altText: req.body.altText || 'Test image description',
                    tags: ['test'],
                    description: 'Test upload'
                };

                const result = await this.imageUsecase.uploadImage(
                    req.file,
                    category,
                    testUserId,
                    metadata
                );

                if (result.success) {
                    res.status(201).json({
                        success: true,
                        message: 'Test upload successful',
                        data: result.data
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                }
            } catch (error) {
                console.error('Test Upload Error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Server error',
                    error: error.message
                });
            }
        }
    ];


    getAllCategories = async (req, res) => {
        try {
            const result = await this.imageUsecase.getAllCategories();

            if (result.success) {
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.error
                });
            }
        } catch (error) {
            console.error('Get Categories Error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    };
}

export default ImageController;