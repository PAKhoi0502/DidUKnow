import { uploadImageFile } from "./media.service.js";

export const uploadImageController = async (req, res, next) => {
    try {
        const uploadedFile = await uploadImageFile(req.file);
        return res.status(201).json({
            message: "media.upload_success",
            data: uploadedFile
        });
    } catch (error) {
        return next(error);
    }
};
