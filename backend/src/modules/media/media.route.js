import express from "express";
import multer from "multer";
import { uploadImageController } from "./media.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { createHttpError } from "../../utils/httpError.js";

const router = express.Router();

const MAX_UPLOAD_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_UPLOAD_FILE_SIZE_BYTES
    },
    fileFilter: (req, file, callback) => {
        if (typeof file?.mimetype === "string" && file.mimetype.startsWith("image/")) {
            return callback(null, true);
        }
        return callback(createHttpError(400, "errors.media_image_only"));
    }
});

const uploadSingleImageMiddleware = (req, res, next) => {
    upload.single("file")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return next(createHttpError(400, "errors.media_file_too_large"));
        }

        if (error?.status && error?.message) {
            return next(error);
        }

        return next(createHttpError(400, "errors.media_invalid_file"));
    });
};

/**
 * @swagger
 * /api/media/upload-image:
 *   post:
 *     tags: [Media]
 *     summary: Upload image file
 *     description: Upload image to Cloudinary and get public URL for fact content.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MediaUploadApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailedResponse'
 *       401:
 *         description: unauthorized
 *       403:
 *         $ref: '#/components/responses/ForbiddenResponse'
 *       502:
 *         description: upload failed
 */
router.post(
    "/upload-image",
    authenticate,
    authorizeRoles("Admin", "Editor"),
    uploadSingleImageMiddleware,
    uploadImageController
);

export default router;
