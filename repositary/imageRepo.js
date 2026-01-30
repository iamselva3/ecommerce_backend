import Image from '../model/imageModel.js';

class ImageRepository {
    // Create new image record
    async create(imageData) {
        try {
            const image = new Image(imageData);
            return await image.save();
        } catch (error) {
            throw error;
        }
    }

    // Find image by ID with user details
    async findById(id) {
        try {
            return await Image.findById(id)
                .populate('uploadedBy', 'name email')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Find images by category with filters and pagination
    async findByCategory(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 20, sort = { sortOrder: 1, createdAt: -1 } } = options;
            const skip = (page - 1) * limit;

            // Build query
            const query = { ...filters };

            // Ensure we only get active images unless specified
            if (query.isActive === undefined) {
                query.isActive = true;
            }

            const images = await Image.find(query)
                .populate('uploadedBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Image.countDocuments(query);

            return {
                images,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Update image
    async update(id, updateData) {
        try {
            return await Image.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('uploadedBy', 'name email')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Delete single image
    async delete(id) {
        try {
            return await Image.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    // Delete all images in category
    async deleteManyByCategory(category) {
        try {
            return await Image.deleteMany({ category });
        } catch (error) {
            throw error;
        }
    }

    // Search images by name, description, altText, or tags
    async searchImages(searchTerm, options = {}) {
        try {
            const { page = 1, limit = 20, category } = options;
            const skip = (page - 1) * limit;

            // Build search query
            const query = {
                isActive: true,
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { altText: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            // Add category filter if provided
            if (category) {
                query.category = category;
            }

            const images = await Image.find(query)
                .populate('uploadedBy', 'name email')
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Image.countDocuments(query);

            return {
                images,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Update sort order for multiple images
    async updateSortOrder(imagesWithOrder) {
        try {
            const bulkOps = imagesWithOrder.map(({ id, sortOrder }) => ({
                updateOne: {
                    filter: { _id: id },
                    update: { $set: { sortOrder } }
                }
            }));

            return await Image.bulkWrite(bulkOps);
        } catch (error) {
            throw error;
        }
    }

    // Count images by filter
    async countByCategory(filter = {}) {
        try {
            if (!filter.isActive) {
                filter.isActive = true;
            }
            return await Image.countDocuments(filter);
        } catch (error) {
            throw error;
        }
    }

    // Find images by multiple IDs
    async findByIds(ids) {
        try {
            return await Image.find({
                _id: { $in: ids },
                isActive: true
            })
                .populate('uploadedBy', 'name email')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Get images by tags
    async findByTags(tags, options = {}) {
        try {
            const { page = 1, limit = 20 } = options;
            const skip = (page - 1) * limit;

            const query = {
                isActive: true,
                tags: { $in: Array.isArray(tags) ? tags : [tags] }
            };

            const images = await Image.find(query)
                .populate('uploadedBy', 'name email')
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Image.countDocuments(query);

            return {
                images,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getFeaturedImages(category = null, limit = 10) {
        try {
            const query = {
                isActive: true,
                isFeatured: true
            };

            if (category) {
                query.category = category;
            }

            return await Image.find(query)
                .populate('uploadedBy', 'name email')
                .sort({ sortOrder: 1, createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            throw error;
        }
    }

    // Get images by uploader
    async findByUploader(uploaderId, options = {}) {
        try {
            const { page = 1, limit = 20 } = options;
            const skip = (page - 1) * limit;

            const query = {
                isActive: true,
                uploadedBy: uploaderId
            };

            const images = await Image.find(query)
                .populate('uploadedBy', 'name email')
                .skip(skip)
                .limit(limit)
                .exec();

            const total = await Image.countDocuments(query);

            return {
                images,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Get latest images
    async getLatestImages(limit = 10) {
        try {
            return await Image.find({ isActive: true })
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit)
                .exec();
        } catch (error) {
            throw error;
        }
    }


    async getAllCategories() {
        try {
            const categories = await Image.aggregate([
                {
                    $match: { isActive: true }
                },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                        image: { $first: "$url" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        slug: "$_id",
                        name: {
                            $concat: [
                                { $toUpper: { $substrCP: ["$_id", 0, 1] } },
                                { $substrCP: ["$_id", 1, { $strLenCP: "$_id" }] }
                            ]
                        },
                        count: 1,
                        image: 1
                    }
                }
            ]);

            return categories;
        } catch (error) {
            throw error;
        }
    }

}

export default ImageRepository;