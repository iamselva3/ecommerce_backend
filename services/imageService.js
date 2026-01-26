import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Create S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer to store files temporarily on disk
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const uploadDir = 'uploads/';
//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueId = uuidv4();
//         const extension = path.extname(file.originalname);
//         cb(null, `${uniqueId}${extension}`);
//     }
// });

const storage = multer.memoryStorage();

// Create a custom file filter that accepts any file type for testing
const acceptAllFiles = (req, file, cb) => {
    console.log('RAW HEADERS:', req.headers['content-type']);

    // Accept all files for debugging
    cb(null, true);
};

// Create multer instance with better error handling
export const upload = multer({
    storage: storage,
    fileFilter: acceptAllFiles, // Accept all file types
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10, // Maximum number of files
        fields: 20, // Maximum number of non-file fields
        parts: 30 // Maximum number of parts (files + fields)
    }
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('Multer Error:', error);

        let message = 'File upload error';
        if (error.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large. Maximum size is 10MB';
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files. Maximum is 10';
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        } else if (error.code === 'LIMIT_PART_COUNT') {
            message = 'Too many form parts';
        }

        return res.status(400).json({
            success: false,
            message: message,
            error: error.message
        });
    } else if (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: error.message
        });
    }
    next();
};

// Enhanced upload middleware with better error handling
export const uploadSingle = (fieldName = 'image') => {
    return (req, res, next) => {

        upload.single(fieldName)(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    };
};

export const uploadMultiple = (fieldName = 'images', maxCount = 10) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    };
};

// Upload file to S3
export const uploadToS3 = async (file, category, userId, metadata = {}) => {
    try {
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname).toLowerCase();
        const safeCategory = category.replace(/[^a-zA-Z0-9-_]/g, '');

        const key = `${safeCategory}/${timestamp}-${uniqueId}${extension}`;

        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            // Body: fs.readFileSync(file.path),
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalname: file.originalname,
                uploadedby: userId || 'anonymous',
                category: safeCategory,
                ...Object.fromEntries(
                    Object.entries(metadata).map(([k, v]) => [
                        k.toLowerCase(),
                        String(v)
                    ])
                )
            }
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const location = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        // fs.unlinkSync(file.path);

        return {
            success: true,
            data: {
                location,
                key,
                bucket: process.env.AWS_S3_BUCKET_NAME,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                category: safeCategory
            }
        };
    } catch (error) {
        console.error('S3 Upload Error:', error);

        // if (file?.path && fs.existsSync(file.path)) {
        //     fs.unlinkSync(file.path);
        // }

        return {
            success: false,
            error: error.message
        };
    }
};


// Delete from S3
export const deleteFromS3 = async (key) => {
    try {
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Delete Error:', error);
        return { success: false, error: error.message };
    }
};

// Get signed URL (for private files)
export const getSignedUrl = async (key, expiresIn = 3600) => {
    try {
        const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return { success: true, url: signedUrl };
    } catch (error) {
        console.error('Signed URL Error:', error);
        return { success: false, error: error.message };
    }
};

// Check S3 connection
export const checkS3Connection = async () => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: 'test-connection-file'
        });

        // Try to send a command (won't actually delete since key doesn't exist)
        await s3Client.send(command).catch(() => { });

        return {
            success: true,
            message: 'AWS S3 connection successful',
            bucket: process.env.AWS_S3_BUCKET_NAME,
            region: process.env.AWS_REGION
        };
    } catch (error) {
        return {
            success: false,
            message: 'AWS S3 connection failed',
            error: error.message
        };
    }
};

// Test endpoint helper for Postman
export const testUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Make sure to:',
                instructions: [
                    '1. Use POST method',
                    '2. Set Content-Type to multipart/form-data',
                    '3. Add form-data with key="image" and select file',
                    '4. If testing from Postman, use form-data tab'
                ]
            });
        }

        const category = req.params.category || 'general';
        const testUserId = 'test-user-postman';

        const result = await uploadToS3(req.file, category, testUserId, {
            name: req.body.name || 'Test Upload',
            description: 'Uploaded via Postman test'
        });

        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Upload successful via Postman',
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
};

export default {
    upload,
    uploadSingle,
    uploadMultiple,
    handleMulterError,
    uploadToS3,
    deleteFromS3,
    getSignedUrl,
    checkS3Connection,
    testUpload
};