import mongoose from "mongoose";
import { normalizeLanguage } from "../../config/i18n.js";

const allowedCreateFields = ["name", "slug", "description", "icon"];
const allowedUpdateFields = ["name", "slug", "description", "icon"];
const allowedTranslationFields = ["name", "description"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

const isValidSlug = (value) => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
};

export const validateCreateCategory = (req, res, next) => {
    const payload = req.body || {};
    const invalidFields = getInvalidFields(payload, allowedCreateFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const {
        name,
        slug,
        description,
        icon
    } = payload;

    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        errors.push("errors.category_name_range_2_60");
    }

    if (slug !== undefined) {
        if (typeof slug !== "string" || slug.trim().length < 2 || slug.trim().length > 80 || !isValidSlug(slug.trim().toLowerCase())) {
            errors.push("errors.slug_invalid_format");
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== "string" || description.trim().length > 500) {
            errors.push("errors.description_string_max_500");
        }
    }

    if (icon !== undefined && icon !== null) {
        if (typeof icon !== "string" || icon.trim().length > 255) {
            errors.push("errors.icon_string_max_255");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        name: name.trim(),
        ...(slug !== undefined ? { slug: slug.trim().toLowerCase() } : {}),
        ...(description !== undefined ? { description: description === null ? null : description.trim() } : {}),
        ...(icon !== undefined ? { icon: icon === null ? null : icon.trim() } : {})
    };

    return next();
};

export const validateUpdateCategory = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.update_payload_required"]
        });
    }

    const invalidFields = getInvalidFields(payload, allowedUpdateFields);
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const {
        name,
        slug,
        description,
        icon
    } = payload;

    const errors = [];

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60)) {
        errors.push("errors.category_name_range_2_60");
    }

    if (slug !== undefined) {
        if (typeof slug !== "string" || slug.trim().length < 2 || slug.trim().length > 80 || !isValidSlug(slug.trim().toLowerCase())) {
            errors.push("errors.slug_invalid_format");
        }
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== "string" || description.trim().length > 500) {
            errors.push("errors.description_string_max_500");
        }
    }

    if (icon !== undefined && icon !== null) {
        if (typeof icon !== "string" || icon.trim().length > 255) {
            errors.push("errors.icon_string_max_255");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(slug !== undefined ? { slug: slug.trim().toLowerCase() } : {}),
        ...(description !== undefined ? { description: description === null ? null : description.trim() } : {}),
        ...(icon !== undefined ? { icon: icon === null ? null : icon.trim() } : {})
    };

    return next();
};

export const validateCategoryIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.id_invalid"]
        });
    }

    return next();
};

export const validateCategoryTranslationLanguageParam = (req, res, next) => {
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

export const validateUpsertCategoryTranslation = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, allowedTranslationFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const { name, description } = payload;
    const errors = [];

    if (!inputKeys.includes("name")) {
        errors.push("errors.name_required");
    } else if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        errors.push("errors.category_name_range_2_60");
    }

    if (description !== undefined && description !== null) {
        if (typeof description !== "string" || description.trim().length > 500) {
            errors.push("errors.description_string_max_500");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        name: name.trim(),
        ...(description !== undefined ? { description: description === null ? null : description.trim() } : {})
    };

    return next();
};
