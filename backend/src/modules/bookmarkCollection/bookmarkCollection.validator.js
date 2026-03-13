import mongoose from "mongoose";

const createAllowedFields = ["name"];
const updateAllowedFields = ["name"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

const validateName = (value, errors) => {
    if (typeof value !== "string") {
        errors.push("errors.bookmark_collection_name_length_invalid");
        return null;
    }

    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 80) {
        errors.push("errors.bookmark_collection_name_length_invalid");
        return null;
    }

    return normalized;
};

export const validateCreateBookmarkCollection = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, createAllowedFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const errors = [];
    if (!inputKeys.includes("name")) {
        errors.push("errors.name_required");
    }

    const normalizedName = inputKeys.includes("name")
        ? validateName(payload.name, errors)
        : null;

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = { name: normalizedName };
    return next();
};

export const validateUpdateBookmarkCollection = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.update_payload_required"]
        });
    }

    const invalidFields = getInvalidFields(payload, updateAllowedFields);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const errors = [];
    const normalizedName = validateName(payload.name, errors);

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = { name: normalizedName };
    return next();
};

export const validateCollectionIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.id_invalid"]
        });
    }
    return next();
};
