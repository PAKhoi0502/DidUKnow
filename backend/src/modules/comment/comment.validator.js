import mongoose from "mongoose";

const createAllowedFields = ["fact_id", "content"];
const updateAllowedFields = ["content"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

const validateContent = (value, errors) => {
    if (typeof value !== "string") {
        errors.push("errors.comment_content_length_invalid");
        return null;
    }

    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > 1000) {
        errors.push("errors.comment_content_length_invalid");
        return null;
    }

    return normalized;
};

export const validateCreateComment = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, createAllowedFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const { fact_id: factId, content } = payload;
    const errors = [];

    if (!inputKeys.includes("fact_id")) {
        errors.push("errors.fact_id_required");
    } else if (typeof factId !== "string" || !mongoose.Types.ObjectId.isValid(factId)) {
        errors.push("errors.fact_id_invalid");
    }

    if (!inputKeys.includes("content")) {
        errors.push("errors.comment_content_required");
    }

    const normalizedContent = inputKeys.includes("content")
        ? validateContent(content, errors)
        : null;

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        fact_id: factId.trim(),
        content: normalizedContent
    };

    return next();
};

export const validateUpdateComment = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, updateAllowedFields);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.update_payload_required"]
        });
    }

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const errors = [];
    const normalizedContent = validateContent(payload.content, errors);

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        content: normalizedContent
    };

    return next();
};

export const validateFactIdParam = (req, res, next) => {
    const { fact_id: factId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(factId)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.fact_id_invalid"]
        });
    }
    return next();
};

export const validateCommentIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.id_invalid"]
        });
    }
    return next();
};
