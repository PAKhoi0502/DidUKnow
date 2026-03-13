import mongoose from "mongoose";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "../../config/i18n.js";

const createAllowedFields = ["title", "short_fact", "content", "category_id"];
const updateAllowedFields = ["title", "short_fact", "content", "category_id"];
const updateStatusAllowedFields = ["status", "reason"];
const upsertTranslationAllowedFields = ["title", "short_fact", "content"];
const allowedFactStatuses = ["draft", "published"];
const CONTENT_IMAGE_MAX_ITEMS = 10;

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

const isNonArrayObject = (value) => {
    return value !== null && typeof value === "object" && !Array.isArray(value);
};

const isValidHttpUrl = (rawValue) => {
    if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
        return false;
    }

    try {
        const parsed = new URL(rawValue.trim());
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (error) {
        return false;
    }
};

const validateAndNormalizeContent = (content, errors) => {
    if (!isNonArrayObject(content)) {
        errors.push("content must be an object");
        return null;
    }

    const { intro, body, conclusion, images } = content;

    if (typeof intro !== "string" || intro.trim().length < 20 || intro.trim().length > 400) {
        errors.push("content.intro must be between 20 and 400 characters");
    }

    if (typeof body !== "string" || body.trim().length < 80 || body.trim().length > 8000) {
        errors.push("content.body must be between 80 and 8000 characters");
    }

    if (typeof conclusion !== "string" || conclusion.trim().length < 20 || conclusion.trim().length > 600) {
        errors.push("content.conclusion must be between 20 and 600 characters");
    }

    if (images !== undefined && !Array.isArray(images)) {
        errors.push("content.images must be an array");
    }

    const normalizedImages = [];

    if (Array.isArray(images)) {
        if (images.length > CONTENT_IMAGE_MAX_ITEMS) {
            errors.push(`content.images can contain at most ${CONTENT_IMAGE_MAX_ITEMS} items`);
        }

        images.forEach((image) => {
            if (!isNonArrayObject(image)) {
                errors.push("content.images items must be objects");
                return;
            }

            const {
                url,
                alt,
                caption
            } = image;

            if (!isValidHttpUrl(url)) {
                errors.push("content.images.url must be a valid http/https URL");
            }

            if (alt !== undefined && alt !== null) {
                if (typeof alt !== "string" || alt.trim().length > 150) {
                    errors.push("content.images.alt must be a string up to 150 characters");
                }
            }

            if (caption !== undefined && caption !== null) {
                if (typeof caption !== "string" || caption.trim().length > 200) {
                    errors.push("content.images.caption must be a string up to 200 characters");
                }
            }

            normalizedImages.push({
                url: typeof url === "string" ? url.trim() : url,
                ...(alt !== undefined ? { alt: alt === null ? null : alt.trim() } : {}),
                ...(caption !== undefined ? { caption: caption === null ? null : caption.trim() } : {})
            });
        });
    }

    return {
        intro: typeof intro === "string" ? intro.trim() : intro,
        body: typeof body === "string" ? body.trim() : body,
        conclusion: typeof conclusion === "string" ? conclusion.trim() : conclusion,
        images: normalizedImages
    };
};

const validateAndNormalizeTranslationContent = (content, errors) => {
    if (!isNonArrayObject(content)) {
        errors.push("content must be an object");
        return null;
    }

    const { intro, body, conclusion, images } = content;

    if (typeof intro !== "string" || intro.trim().length < 20 || intro.trim().length > 400) {
        errors.push("content.intro must be between 20 and 400 characters");
    }

    if (typeof body !== "string" || body.trim().length < 80 || body.trim().length > 8000) {
        errors.push("content.body must be between 80 and 8000 characters");
    }

    if (typeof conclusion !== "string" || conclusion.trim().length < 20 || conclusion.trim().length > 600) {
        errors.push("content.conclusion must be between 20 and 600 characters");
    }

    if (images !== undefined && !Array.isArray(images)) {
        errors.push("content.images must be an array");
    }

    const normalizedImages = [];

    if (Array.isArray(images)) {
        if (images.length > CONTENT_IMAGE_MAX_ITEMS) {
            errors.push(`content.images can contain at most ${CONTENT_IMAGE_MAX_ITEMS} items`);
        }

        images.forEach((image) => {
            if (!isNonArrayObject(image)) {
                errors.push("content.images items must be objects");
                return;
            }

            const {
                url,
                alt,
                caption
            } = image;

            if (url !== undefined && url !== null && !isValidHttpUrl(url)) {
                errors.push("content.images.url must be a valid http/https URL");
            }

            if (alt !== undefined && alt !== null) {
                if (typeof alt !== "string" || alt.trim().length > 150) {
                    errors.push("content.images.alt must be a string up to 150 characters");
                }
            }

            if (caption !== undefined && caption !== null) {
                if (typeof caption !== "string" || caption.trim().length > 200) {
                    errors.push("content.images.caption must be a string up to 200 characters");
                }
            }

            normalizedImages.push({
                ...(url !== undefined ? { url: url === null ? null : url.trim() } : {}),
                ...(alt !== undefined ? { alt: alt === null ? null : alt.trim() } : {}),
                ...(caption !== undefined ? { caption: caption === null ? null : caption.trim() } : {})
            });
        });
    }

    return {
        intro: typeof intro === "string" ? intro.trim() : intro,
        body: typeof body === "string" ? body.trim() : body,
        conclusion: typeof conclusion === "string" ? conclusion.trim() : conclusion,
        images: normalizedImages
    };
};

const validateCategoryIdWithOptionalExistenceCheck = async (categoryId, errors) => {
    if (typeof categoryId !== "string" || !mongoose.Types.ObjectId.isValid(categoryId)) {
        errors.push("category_id must be a valid ObjectId");
        return;
    }

    const CategoryModel = mongoose.models.Category;
    if (!CategoryModel) {
        return;
    }

    const categoryExists = await CategoryModel.exists({ _id: categoryId });
    if (!categoryExists) {
        errors.push("category_id does not exist");
    }
};

export const validateCreateFact = async (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);

    const invalidFields = getInvalidFields(payload, createAllowedFields);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const {
        title,
        short_fact: shortFact,
        content,
        category_id: categoryId
    } = payload;

    const errors = [];

    if (!inputKeys.includes("title")) {
        errors.push("title is required");
    } else if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 150) {
        errors.push("title must be between 5 and 150 characters");
    }

    if (!inputKeys.includes("short_fact")) {
        errors.push("short_fact is required");
    } else if (typeof shortFact !== "string" || shortFact.trim().length < 10 || shortFact.trim().length > 280) {
        errors.push("short_fact must be between 10 and 280 characters");
    }

    if (!inputKeys.includes("content")) {
        errors.push("content is required");
    }

    const normalizedContent = inputKeys.includes("content")
        ? validateAndNormalizeContent(content, errors)
        : null;

    if (!inputKeys.includes("category_id")) {
        errors.push("category_id is required");
    } else {
        try {
            await validateCategoryIdWithOptionalExistenceCheck(categoryId, errors);
        } catch (error) {
            return res.status(500).json({
                message: "errors.internal_server_error",
                error: error.message
            });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        title: title.trim(),
        short_fact: shortFact.trim(),
        content: normalizedContent,
        category_id: categoryId
    };

    return next();
};

export const validateUpdateFact = async (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["At least one field is required for update"]
        });
    }

    const invalidFields = getInvalidFields(payload, updateAllowedFields);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const {
        title,
        short_fact: shortFact,
        content,
        category_id: categoryId
    } = payload;

    const errors = [];

    if (title !== undefined && (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 150)) {
        errors.push("title must be between 5 and 150 characters");
    }

    if (shortFact !== undefined
        && (typeof shortFact !== "string" || shortFact.trim().length < 10 || shortFact.trim().length > 280)) {
        errors.push("short_fact must be between 10 and 280 characters");
    }

    const normalizedContent = content !== undefined
        ? validateAndNormalizeContent(content, errors)
        : undefined;

    if (categoryId !== undefined) {
        try {
            await validateCategoryIdWithOptionalExistenceCheck(categoryId, errors);
        } catch (error) {
            return res.status(500).json({
                message: "errors.internal_server_error",
                error: error.message
            });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(shortFact !== undefined ? { short_fact: shortFact.trim() } : {}),
        ...(normalizedContent !== undefined ? { content: normalizedContent } : {}),
        ...(categoryId !== undefined ? { category_id: categoryId } : {})
    };

    return next();
};

export const validateUpdateFactStatus = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);

    const invalidFields = getInvalidFields(payload, updateStatusAllowedFields);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const { status, reason } = payload;
    const errors = [];

    if (!inputKeys.includes("status")) {
        errors.push("status is required");
    } else if (!allowedFactStatuses.includes(status)) {
        errors.push("status must be one of: draft, published");
    }

    if (reason !== undefined && (typeof reason !== "string" || reason.trim().length < 3)) {
        errors.push("reason must be at least 3 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        status,
        ...(reason !== undefined ? { reason: reason.trim() } : {})
    };

    return next();
};

export const validateFactIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["id must be a valid ObjectId"]
        });
    }

    return next();
};

export const validateFactTranslationLanguageParam = (req, res, next) => {
    const language = normalizeLanguage(req.params.language);

    if (!language) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["language must be one of: vi, en"]
        });
    }

    req.params.language = language;
    return next();
};

export const validateUpsertFactTranslation = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, upsertTranslationAllowedFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const {
        title,
        short_fact: shortFact,
        content
    } = payload;

    const errors = [];

    if (!inputKeys.includes("title")) {
        errors.push("title is required");
    } else if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 150) {
        errors.push("title must be between 5 and 150 characters");
    }

    if (!inputKeys.includes("short_fact")) {
        errors.push("short_fact is required");
    } else if (typeof shortFact !== "string" || shortFact.trim().length < 10 || shortFact.trim().length > 280) {
        errors.push("short_fact must be between 10 and 280 characters");
    }

    if (!inputKeys.includes("content")) {
        errors.push("content is required");
    }

    const isDefaultLanguageTranslation = req.params.language === DEFAULT_LANGUAGE;
    const normalizedContent = inputKeys.includes("content")
        ? (
            isDefaultLanguageTranslation
                ? validateAndNormalizeContent(content, errors)
                : validateAndNormalizeTranslationContent(content, errors)
        )
        : null;

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        title: title.trim(),
        short_fact: shortFact.trim(),
        content: normalizedContent
    };

    return next();
};
