import mongoose from "mongoose";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "../../config/i18n.js";

const createAllowedFields = ["title", "short_fact", "content", "category_id", "tag_ids"];
const updateAllowedFields = ["title", "short_fact", "content", "category_id", "tag_ids"];
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
        errors.push("errors.fact_content_object_required");
        return null;
    }

    const { intro, body, conclusion, images } = content;

    if (typeof intro !== "string" || intro.trim().length < 20 || intro.trim().length > 400) {
        errors.push("errors.fact_content_intro_range_20_400");
    }

    if (typeof body !== "string" || body.trim().length < 80 || body.trim().length > 8000) {
        errors.push("errors.fact_content_body_range_80_8000");
    }

    if (typeof conclusion !== "string" || conclusion.trim().length < 20 || conclusion.trim().length > 600) {
        errors.push("errors.fact_content_conclusion_range_20_600");
    }

    if (images !== undefined && !Array.isArray(images)) {
        errors.push("errors.fact_content_images_array");
    }

    const normalizedImages = [];

    if (Array.isArray(images)) {
        if (images.length > CONTENT_IMAGE_MAX_ITEMS) {
            errors.push("errors.fact_content_images_max_10");
        }

        images.forEach((image) => {
            if (!isNonArrayObject(image)) {
                errors.push("errors.fact_content_images_item_object");
                return;
            }

            const {
                url,
                alt,
                caption
            } = image;

            if (!isValidHttpUrl(url)) {
                errors.push("errors.fact_content_image_url_invalid");
            }

            if (alt !== undefined && alt !== null) {
                if (typeof alt !== "string" || alt.trim().length > 150) {
                    errors.push("errors.fact_content_image_alt_max_150");
                }
            }

            if (caption !== undefined && caption !== null) {
                if (typeof caption !== "string" || caption.trim().length > 200) {
                    errors.push("errors.fact_content_image_caption_max_200");
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
        errors.push("errors.fact_content_object_required");
        return null;
    }

    const { intro, body, conclusion, images } = content;

    if (typeof intro !== "string" || intro.trim().length < 20 || intro.trim().length > 400) {
        errors.push("errors.fact_content_intro_range_20_400");
    }

    if (typeof body !== "string" || body.trim().length < 80 || body.trim().length > 8000) {
        errors.push("errors.fact_content_body_range_80_8000");
    }

    if (typeof conclusion !== "string" || conclusion.trim().length < 20 || conclusion.trim().length > 600) {
        errors.push("errors.fact_content_conclusion_range_20_600");
    }

    if (images !== undefined && !Array.isArray(images)) {
        errors.push("errors.fact_content_images_array");
    }

    const normalizedImages = [];

    if (Array.isArray(images)) {
        if (images.length > CONTENT_IMAGE_MAX_ITEMS) {
            errors.push("errors.fact_content_images_max_10");
        }

        images.forEach((image) => {
            if (!isNonArrayObject(image)) {
                errors.push("errors.fact_content_images_item_object");
                return;
            }

            const {
                url,
                alt,
                caption
            } = image;

            if (url !== undefined && url !== null && !isValidHttpUrl(url)) {
                errors.push("errors.fact_content_image_url_invalid");
            }

            if (alt !== undefined && alt !== null) {
                if (typeof alt !== "string" || alt.trim().length > 150) {
                    errors.push("errors.fact_content_image_alt_max_150");
                }
            }

            if (caption !== undefined && caption !== null) {
                if (typeof caption !== "string" || caption.trim().length > 200) {
                    errors.push("errors.fact_content_image_caption_max_200");
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
        errors.push("errors.category_id_invalid");
        return;
    }

    const CategoryModel = mongoose.models.Category;
    if (!CategoryModel) {
        return;
    }

    const categoryExists = await CategoryModel.exists({ _id: categoryId });
    if (!categoryExists) {
        errors.push("errors.category_id_not_found");
    }
};

const normalizeObjectIdList = (rawValues) => {
    if (!Array.isArray(rawValues)) {
        return null;
    }

    const normalizedIds = rawValues
        .map((value) => String(value || "").trim())
        .filter(Boolean);

    return [...new Set(normalizedIds)];
};

const validateTagIdsWithOptionalExistenceCheck = async (rawTagIds, errors) => {
    const normalizedTagIds = normalizeObjectIdList(rawTagIds);
    if (!normalizedTagIds) {
        errors.push("errors.tag_ids_array_invalid");
        return [];
    }

    if (normalizedTagIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        errors.push("errors.tag_ids_invalid");
        return [];
    }

    const TagModel = mongoose.models.Tag;
    if (!TagModel || normalizedTagIds.length === 0) {
        return normalizedTagIds;
    }

    const existingCount = await TagModel.countDocuments({
        _id: { $in: normalizedTagIds }
    });

    if (existingCount !== normalizedTagIds.length) {
        errors.push("errors.tag_ids_not_found");
    }

    return normalizedTagIds;
};

export const validateCreateFact = async (req, res, next) => {
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

    const {
        title,
        short_fact: shortFact,
        content,
        category_id: categoryId,
        tag_ids: tagIds
    } = payload;

    const errors = [];

    if (!inputKeys.includes("title")) {
        errors.push("errors.fact_title_required");
    } else if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 150) {
        errors.push("errors.fact_title_range_5_150");
    }

    if (!inputKeys.includes("short_fact")) {
        errors.push("errors.fact_short_fact_required");
    } else if (typeof shortFact !== "string" || shortFact.trim().length < 10 || shortFact.trim().length > 280) {
        errors.push("errors.fact_short_fact_range_10_280");
    }

    if (!inputKeys.includes("content")) {
        errors.push("errors.fact_content_required");
    }

    const normalizedContent = inputKeys.includes("content")
        ? validateAndNormalizeContent(content, errors)
        : null;

    if (!inputKeys.includes("category_id")) {
        errors.push("errors.category_id_required");
    } else {
        try {
            await validateCategoryIdWithOptionalExistenceCheck(categoryId, errors);
        } catch (error) {
            return res.status(500).json({
                message: "errors.internal_server_error"
            });
        }
    }

    let normalizedTagIds = [];
    if (inputKeys.includes("tag_ids")) {
        try {
            normalizedTagIds = await validateTagIdsWithOptionalExistenceCheck(tagIds, errors);
        } catch (error) {
            return res.status(500).json({
                message: "errors.internal_server_error"
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
        category_id: categoryId,
        tag_ids: normalizedTagIds
    };

    return next();
};

export const validateUpdateFact = async (req, res, next) => {
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
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const {
        title,
        short_fact: shortFact,
        content,
        category_id: categoryId,
        tag_ids: tagIds
    } = payload;

    const errors = [];

    if (title !== undefined && (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 150)) {
        errors.push("errors.fact_title_range_5_150");
    }

    if (shortFact !== undefined
        && (typeof shortFact !== "string" || shortFact.trim().length < 10 || shortFact.trim().length > 280)) {
        errors.push("errors.fact_short_fact_range_10_280");
    }

    const normalizedContent = content !== undefined
        ? validateAndNormalizeContent(content, errors)
        : undefined;

    if (categoryId !== undefined) {
        try {
            await validateCategoryIdWithOptionalExistenceCheck(categoryId, errors);
        } catch (error) {
            return res.status(500).json({
                message: "errors.internal_server_error"
            });
        }
    }

    let normalizedTagIds;
    if (tagIds !== undefined) {
        try {
            normalizedTagIds = await validateTagIdsWithOptionalExistenceCheck(tagIds, errors);
        } catch (error) {
            return res.status(500).json({
                message: "errors.internal_server_error"
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
        ...(categoryId !== undefined ? { category_id: categoryId } : {}),
        ...(normalizedTagIds !== undefined ? { tag_ids: normalizedTagIds } : {})
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
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const { status, reason } = payload;
    const errors = [];

    if (!inputKeys.includes("status")) {
        errors.push("errors.status_required");
    } else if (!allowedFactStatuses.includes(status)) {
        errors.push("errors.fact_status_invalid");
    }

    if (reason !== undefined && (typeof reason !== "string" || reason.trim().length < 3)) {
        errors.push("errors.reason_min_length_3");
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
            errors: ["errors.id_invalid"]
        });
    }

    return next();
};

export const validateFactTranslationLanguageParam = (req, res, next) => {
    const language = normalizeLanguage(req.params.language);

    if (!language) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.language_invalid_vi_en"]
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
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const {
        title,
        short_fact: shortFact,
        content
    } = payload;

    const errors = [];

    if (!inputKeys.includes("title")) {
        errors.push("errors.fact_title_required");
    } else if (typeof title !== "string" || title.trim().length < 5 || title.trim().length > 150) {
        errors.push("errors.fact_title_range_5_150");
    }

    if (!inputKeys.includes("short_fact")) {
        errors.push("errors.fact_short_fact_required");
    } else if (typeof shortFact !== "string" || shortFact.trim().length < 10 || shortFact.trim().length > 280) {
        errors.push("errors.fact_short_fact_range_10_280");
    }

    if (!inputKeys.includes("content")) {
        errors.push("errors.fact_content_required");
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
