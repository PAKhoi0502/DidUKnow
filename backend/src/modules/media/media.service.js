import { getCloudinaryClient } from "../../config/cloudinary.js";
import { createHttpError } from "../../utils/httpError.js";

const DEFAULT_UPLOAD_FOLDER = "diduknow/facts";

const toMediaResponse = (uploadedAsset) => {
    return {
        url: uploadedAsset.secure_url,
        public_id: uploadedAsset.public_id,
        width: uploadedAsset.width ?? null,
        height: uploadedAsset.height ?? null,
        format: uploadedAsset.format ?? null,
        bytes: uploadedAsset.bytes ?? null,
        resource_type: uploadedAsset.resource_type ?? "image"
    };
};

export const uploadImageFile = async (file) => {
    if (!file) {
        throw createHttpError(400, "errors.media_file_required");
    }

    if (typeof file.mimetype !== "string" || !file.mimetype.startsWith("image/")) {
        throw createHttpError(400, "errors.media_image_only");
    }

    const cloudinary = getCloudinaryClient();
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || DEFAULT_UPLOAD_FOLDER;
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    try {
        const uploadedAsset = await cloudinary.uploader.upload(dataUri, {
            folder,
            resource_type: "image"
        });
        return toMediaResponse(uploadedAsset);
    } catch (error) {
        throw createHttpError(502, "errors.media_upload_failed");
    }
};
