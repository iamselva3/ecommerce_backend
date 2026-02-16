import ImageRepository from '../repositary/imageRepo.js';
import { uploadToS3, deleteFromS3, getSignedUrl } from '../services/imageService.js';

class ImageUsecase {
    constructor() {
        this.imageRepository = new ImageRepository();
    }

    // Helper method to safely generate signed URLs
    async generateSignedUrlSafe(s3Key, expiresIn = 3600) {
        if (!s3Key || typeof s3Key !== 'string' || s3Key.trim() === '') {
            console.warn('Invalid s3Key provided to generateSignedUrlSafe:', s3Key);
            return null;
        }

        try {
            const result = await getSignedUrl(s3Key.trim(), expiresIn);
            return result.success ? result.url : null;
        } catch (error) {
            console.error(`Error generating signed URL for ${s3Key}:`, error.message);
            return null;
        }
    }

    async uploadImage(file, category, userId, metadata = {}) {
        try {
            console.log(`Starting upload for category: ${category}, user: ${userId}`);

            // Upload to S3
            const uploadResult = await uploadToS3(file, category, userId, metadata);

            if (!uploadResult.success) {
                return {
                    success: false,
                    error: uploadResult.error || 'Failed to upload to S3'
                };
            }

            // Prepare image data for database
            const imageData = {
                name: metadata.name || file.originalname.split('.')[0],
                description: metadata.description || '',
                sizes: metadata?.sizes || ['m'],
                price: metadata?.price || 0,
                url: uploadResult.data.location,
                s3Key: uploadResult.data.key,
                category: category,
                subCategory: metadata.subCategory || null,
                altText: metadata.altText || '',
                tags: metadata.tags || [],
                uploadedBy: userId,
                isFeatured: metadata.isFeatured || false,
                sortOrder: parseInt(metadata.sortOrder) || 0,
                metadata: {
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                    encoding: file.encoding
                }
            };

            // Save to database
            const savedImage = await this.imageRepository.create(imageData);
            console.log(`Image saved to database with ID: ${savedImage._id}`);

            // Generate signed URL safely
            const signedUrl = await this.generateSignedUrlSafe(uploadResult.data.key, 3600);

            return {
                success: true,
                data: {
                    image: savedImage,
                    signedUrl: signedUrl || uploadResult.data.location,
                    publicUrl: uploadResult.data.location
                }
            };
        } catch (error) {
            console.error('Upload Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload image'
            };
        }
    }

    async uploadMultipleImages(files, category, userId, metadataArray = []) {
        try {
            const metadata = metadataArray[0] || {};
            const imageUploads = [];

            for (const file of files) {
                const uploadResult = await uploadToS3(file, category, userId, metadata);

                if (!uploadResult.success) continue;

                imageUploads.push({
                    url: uploadResult.data.location,
                    s3Key: uploadResult.data.key,
                    altText: metadata.altText || '',
                    sortOrder: 0
                });
            }

            if (imageUploads.length === 0) {
                return {
                    success: false,
                    error: 'No images uploaded'
                };
            }

            const imageData = {
                name: metadata.name || 'Product',
                description: metadata.description || '',
                sizes: metadata?.sizes || ['m'],
                price: metadata?.price || 0,
                images: imageUploads,
                category,
                subCategory: metadata.subCategory || null,
                tags: metadata.tags || [],
                uploadedBy: userId,
                isFeatured: metadata.isFeatured || false,
                metadata: {
                    totalImages: imageUploads.length
                }
            };

            const savedProduct = await this.imageRepository.create(imageData);

            return {
                success: true,
                data: savedProduct
            };

        } catch (error) {
            console.error('Multiple Upload Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getImagesByCategory(category, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                subCategory,
                tags,
                featured,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            // Build filters
            const filters = { category };

            if (subCategory) {
                filters.subCategory = subCategory;
            }

            if (tags) {
                filters.tags = { $in: tags };
            }

            if (featured !== undefined) {
                filters.isFeatured = featured;
            }

            // Build sort options
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const result = await this.imageRepository.findByCategory(
                filters,
                { page, limit, sort }
            );

            // Generate signed URLs safely for each image
            const imagesWithSignedUrls = await Promise.all(
                result.images.map(async (product) => {
                    const productObj = product.toObject();

                    if (productObj.images && productObj.images.length > 0) {
                        for (const img of productObj.images) {
                            if (img.s3Key && img.s3Key.trim() !== '') {
                                const signedUrl = await this.generateSignedUrlSafe(img.s3Key, 3600);
                                img.signedUrl = signedUrl || img.url;
                            } else {
                                img.signedUrl = img.url;
                            }
                        }
                    }

                    return productObj;
                })
            );

            return {
                success: true,
                data: {
                    images: imagesWithSignedUrls,
                    pagination: result.pagination
                }
            };
        } catch (error) {
            console.error('Get Images Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get images'
            };
        }
    }

    async getImageById(id) {
        try {
            const image = await this.imageRepository.findById(id);

            if (!image) {
                return {
                    success: false,
                    error: 'Image not found'
                };
            }

            const imageObj = image.toObject();

            if (imageObj.images && imageObj.images.length > 0) {
                for (const img of imageObj.images) {
                    if (img.s3Key && img.s3Key.trim() !== '') {
                        const signedUrl = await this.generateSignedUrlSafe(img.s3Key, 3600);
                        img.signedUrl = signedUrl || img.url;
                    } else {
                        img.signedUrl = img.url;
                    }
                }
            }

            return {
                success: true,
                data: {
                    image: imageObj
                }
            };

        } catch (error) {
            console.error('Get Image Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get image'
            };
        }
    }

    async updateImage(id, updateData, userId, userRole) {
        try {
            // Check if image exists
            const existingImage = await this.imageRepository.findById(id);
            if (!existingImage) {
                return {
                    success: false,
                    error: 'Image not found'
                };
            }

            // Authorization check
            if (userRole !== 'admin' && existingImage.uploadedBy.toString() !== userId.toString()) {
                return {
                    success: false,
                    error: 'Unauthorized to update this image'
                };
            }

            // Prepare update data (only allowed fields for non-admins)
            const allowedFields = ['name', 'description', 'price', 'sizes', 'altText', 'tags', 'subCategory', 'sortOrder'];
            const adminOnlyFields = ['isFeatured', 'category', 'sizes', 'price', 'name', 'description'];

            const finalUpdateData = {};

            // Non-admin users can update these fields
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    finalUpdateData[field] = updateData[field];
                }
            });

            // Admin users can also update admin-only fields
            if (userRole === 'admin') {
                adminOnlyFields.forEach(field => {
                    if (updateData[field] !== undefined) {
                        finalUpdateData[field] = updateData[field];
                    }
                });
            }

            // Update image
            const updatedImage = await this.imageRepository.update(id, finalUpdateData);

            return {
                success: true,
                data: {
                    image: updatedImage
                }
            };
        } catch (error) {
            console.error('Update Image Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update image'
            };
        }
    }

    async deleteImage(id, userId, userRole) {
        try {
            // Check if image exists
            const image = await this.imageRepository.findById(id);
            if (!image) {
                return {
                    success: false,
                    error: 'Image not found'
                };
            }

            // Authorization check
            if (userRole !== 'admin' && image.uploadedBy.toString() !== userId.toString()) {
                return {
                    success: false,
                    error: 'Unauthorized to delete this image'
                };
            }

            // Delete from S3 if s3Key exists
            if (image.s3Key && image.s3Key.trim() !== '') {
                const deleteResult = await deleteFromS3(image.s3Key);
                if (!deleteResult.success) {
                    console.warn(`Failed to delete image from S3: ${image.s3Key}`);
                }
            }

            // Delete from database
            await this.imageRepository.delete(id);

            return {
                success: true,
                message: 'Image deleted successfully'
            };
        } catch (error) {
            console.error('Delete Image Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete image'
            };
        }
    }

    async deleteImagesByCategory(category, userId, userRole) {
        try {
            // Only admin can delete all images in a category
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            // Get all images in category
            const result = await this.imageRepository.findByCategory(
                { category },
                { page: 1, limit: 1000 }
            );

            const images = result.images;

            if (images.length === 0) {
                return {
                    success: true,
                    message: 'No images found in this category'
                };
            }

            // Delete each image from S3 (only if s3Key exists)
            const deletePromises = images
                .filter(img => img.s3Key && img.s3Key.trim() !== '')
                .map(image => deleteFromS3(image.s3Key));

            const deleteResults = await Promise.all(deletePromises);
            const successfulDeletes = deleteResults.filter(r => r.success).length;

            // Delete from database
            await this.imageRepository.deleteManyByCategory(category);

            return {
                success: true,
                message: `Deleted ${images.length} images from category '${category}'`,
                data: {
                    total: images.length,
                    s3Deletes: successfulDeletes,
                    dbDeletes: images.length
                }
            };
        } catch (error) {
            console.error('Delete Category Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete images by category'
            };
        }
    }

    async searchImages(searchTerm, options = {}) {
        try {
            const { category, page = 1, limit = 20 } = options;

            if (!searchTerm || searchTerm.trim() === '') {
                return {
                    success: false,
                    error: 'Search term is required'
                };
            }

            const result = await this.imageRepository.searchImages(
                searchTerm.trim(),
                { category, page, limit }
            );

            // Generate signed URLs safely
            const imagesWithSignedUrls = await Promise.all(
                result.images.map(async (image) => {
                    const imageObj = image.toObject();

                    if (imageObj.images && imageObj.images.length > 0) {
                        for (const img of imageObj.images) {
                            if (img.s3Key && img.s3Key.trim() !== '') {
                                const signedUrl = await this.generateSignedUrlSafe(img.s3Key, 3600);
                                img.signedUrl = signedUrl || img.url;
                            } else {
                                img.signedUrl = img.url;
                            }
                        }
                    }

                    return imageObj;
                })
            );

            return {
                success: true,
                data: {
                    query: searchTerm,
                    images: imagesWithSignedUrls,
                    pagination: result.pagination
                }
            };
        } catch (error) {
            console.error('Search Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to search images'
            };
        }
    }

    async updateSortOrder(imagesWithOrder, userId, userRole) {
        try {
            // Only admin can update sort order
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            if (!Array.isArray(imagesWithOrder) || imagesWithOrder.length === 0) {
                return {
                    success: false,
                    error: 'Images array is required'
                };
            }

            // Validate input
            const validImages = imagesWithOrder.filter(img =>
                img.id && typeof img.sortOrder === 'number'
            );

            await this.imageRepository.updateSortOrder(validImages);

            return {
                success: true,
                message: 'Sort order updated successfully',
                data: {
                    updatedCount: validImages.length
                }
            };
        } catch (error) {
            console.error('Sort Order Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update sort order'
            };
        }
    }

    async toggleFeatured(id, userId, userRole) {
        try {
            // Only admin can toggle featured status
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            const image = await this.imageRepository.findById(id);
            if (!image) {
                return {
                    success: false,
                    error: 'Image not found'
                };
            }

            const updatedImage = await this.imageRepository.update(id, {
                isFeatured: !image.isFeatured
            });

            return {
                success: true,
                data: {
                    image: updatedImage
                },
                message: `Image ${updatedImage.isFeatured ? 'marked as' : 'unmarked from'} featured`
            };
        } catch (error) {
            console.error('Toggle Featured Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to toggle featured status'
            };
        }
    }

    async getFeaturedImages(category = null, limit = 10) {
        try {
            const images = await this.imageRepository.getFeaturedImages(category, limit);

            // Generate signed URLs safely
            const imagesWithSignedUrls = await Promise.all(
                images.map(async (image) => {
                    const imageObj = image.toObject();

                    if (imageObj.images && imageObj.images.length > 0) {
                        for (const img of imageObj.images) {
                            if (img.s3Key && img.s3Key.trim() !== '') {
                                const signedUrl = await this.generateSignedUrlSafe(img.s3Key, 3600);
                                img.signedUrl = signedUrl || img.url;
                            } else {
                                img.signedUrl = img.url;
                            }
                        }
                    }

                    return imageObj;
                })
            );

            return {
                success: true,
                data: {
                    images: imagesWithSignedUrls,
                    count: imagesWithSignedUrls.length
                }
            };
        } catch (error) {
            console.error('Get Featured Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get featured images'
            };
        }
    }

    async getImageStats(userRole) {
        try {
            // Only admin can view statistics
            if (userRole !== 'admin') {
                return {
                    success: false,
                    error: 'Admin access required'
                };
            }

            // Get counts by category
            const categories = ['products', 'categories', 'banners', 'users', 'brands', 'reviews', 'general'];
            const statsPromises = categories.map(async (category) => {
                const count = await this.imageRepository.countByCategory({ category });
                return { category, count };
            });

            const categoryStats = await Promise.all(statsPromises);

            // Get total count
            const totalCount = categoryStats.reduce((sum, stat) => sum + stat.count, 0);

            // Get featured count
            const featuredCount = await this.imageRepository.countByCategory({ isFeatured: true });

            return {
                success: true,
                data: {
                    total: totalCount,
                    featured: featuredCount,
                    byCategory: categoryStats,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Get Stats Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get statistics'
            };
        }
    }

    async getImagesByTags(tags, options = {}) {
        try {
            const { page = 1, limit = 20 } = options;

            if (!tags || tags.length === 0) {
                return {
                    success: false,
                    error: 'Tags are required'
                };
            }

            const tagArray = Array.isArray(tags) ? tags : [tags];
            const result = await this.imageRepository.findByTags(tagArray, { page, limit });

            // Generate signed URLs safely
            const imagesWithSignedUrls = await Promise.all(
                result.images.map(async (image) => {
                    const imageObj = image.toObject();

                    if (imageObj.images && imageObj.images.length > 0) {
                        for (const img of imageObj.images) {
                            if (img.s3Key && img.s3Key.trim() !== '') {
                                const signedUrl = await this.generateSignedUrlSafe(img.s3Key, 3600);
                                img.signedUrl = signedUrl || img.url;
                            } else {
                                img.signedUrl = img.url;
                            }
                        }
                    }

                    return imageObj;
                })
            );

            return {
                success: true,
                data: {
                    tags: tagArray,
                    images: imagesWithSignedUrls,
                    pagination: result.pagination
                }
            };
        } catch (error) {
            console.error('Get by Tags Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get images by tags'
            };
        }
    }

    async getLatestImages(limit = 10) {
        try {
            const images = await this.imageRepository.getLatestImages(limit);

            // Generate signed URLs safely
            const imagesWithSignedUrls = await Promise.all(
                images.map(async (image) => {
                    const imageObj = image.toObject();

                    if (imageObj.images && imageObj.images.length > 0) {
                        for (const img of imageObj.images) {
                            if (img.s3Key && img.s3Key.trim() !== '') {
                                const signedUrl = await this.generateSignedUrlSafe(img.s3Key, 3600);
                                img.signedUrl = signedUrl || img.url;
                            } else {
                                img.signedUrl = img.url;
                            }
                        }
                    }

                    return imageObj;
                })
            );

            return {
                success: true,
                data: {
                    images: imagesWithSignedUrls,
                    count: imagesWithSignedUrls.length
                }
            };
        } catch (error) {
            console.error('Get Latest Usecase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to get latest images'
            };
        }
    }

    async getAllCategories() {
        try {
            const categories = await this.imageRepository.getAllCategories();

            if (!categories || categories.length === 0) {
                return {
                    success: false,
                    message: "No categories found"
                };
            }

            return {
                success: true,
                data: categories
            };
        } catch (error) {
            console.error('Get Categories Usecase Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default ImageUsecase;