import { v2 as cloudinary } from "cloudinary";
import { createHttpError } from "../utils/httpError.js";

let isConfigured = false;

const getRequiredEnv = (name) => {
    const value = process.env[name];
    if (typeof value !== "string" || value.trim().length === 0) {
        throw createHttpError(500, "errors.media_provider_not_configured");
    }
    return value.trim();
};

export const getCloudinaryClient = () => {
    if (!isConfigured) {
        cloudinary.config({
            cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
            api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
            api_secret: getRequiredEnv("CLOUDINARY_API_SECRET")
        });
        isConfigured = true;
    }

    return cloudinary;
};
