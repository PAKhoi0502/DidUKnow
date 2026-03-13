import mongoose from "mongoose";
import Category from "./category.model.js";
import Fact from "../fact/fact.model.js";
import CategoryTranslation from "./categoryTranslation.model.js";
import { logAdminAction } from "../adminLog/adminLog.service.js";
import { ADMIN_LOG_ACTION, ADMIN_LOG_TARGET_TYPE } from "../adminLog/adminLog.model.js";
import { createHttpError } from "../../utils/httpError.js";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "../../config/i18n.js";

const toSlug = (value) => {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const mapCategoryResponse = (categoryDoc) => {
    return {
        id: categoryDoc._id,
        name: categoryDoc.name,
        slug: categoryDoc.slug,
        description: categoryDoc.description,
        icon: categoryDoc.icon,
        created_at: categoryDoc.created_at,
        updated_at: categoryDoc.updated_at
    };
};

const mapCategoryTranslationResponse = (translationDoc) => {
    return {
        id: translationDoc._id,
        category_id: translationDoc.category_id,
        language: translationDoc.language,
        name: translationDoc.name,
        description: translationDoc.description,
        created_at: translationDoc.created_at,
        updated_at: translationDoc.updated_at
    };
};

const getPreferredLanguage = (language) => {
    return normalizeLanguage(language) ?? DEFAULT_LANGUAGE;
};

const applyCategoryTranslation = (categoryDoc, translationDoc) => {
    if (!translationDoc) {
        return categoryDoc;
    }

    return {
        ...categoryDoc,
        name: translationDoc.name,
        description: translationDoc.description
    };
};

const hydrateCategoryTranslations = async (categoryDocs, language) => {
    if (!Array.isArray(categoryDocs) || categoryDocs.length === 0) {
        return [];
    }

    const preferredLanguage = getPreferredLanguage(language);
    const categoryIds = categoryDocs.map((category) => category._id);
    const translations = await CategoryTranslation.find({
        category_id: { $in: categoryIds },
        language: { $in: [preferredLanguage, DEFAULT_LANGUAGE] }
    }).lean();

    const translationByCategoryId = new Map();
    for (const translation of translations) {
        const key = translation.category_id.toString();
        const existing = translationByCategoryId.get(key);

        if (!existing) {
            translationByCategoryId.set(key, translation);
            continue;
        }

        if (existing.language !== preferredLanguage && translation.language === preferredLanguage) {
            translationByCategoryId.set(key, translation);
        }
    }

    return categoryDocs.map((category) => {
        const translation = translationByCategoryId.get(category._id.toString());
        return applyCategoryTranslation(category, translation);
    });
};

const upsertDefaultCategoryTranslation = async (categoryDoc) => {
    await CategoryTranslation.findOneAndUpdate(
        {
            category_id: categoryDoc._id,
            language: DEFAULT_LANGUAGE
        },
        {
            $set: {
                name: categoryDoc.name,
                description: categoryDoc.description ?? null
            }
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    );
};

export const getAllCategories = async (language = DEFAULT_LANGUAGE) => {
    const categories = await Category.find({})
        .sort({ created_at: -1 })
        .lean();

    const localizedCategories = await hydrateCategoryTranslations(categories, language);
    return localizedCategories.map(mapCategoryResponse);
};

export const getCategoryById = async (categoryId, language = DEFAULT_LANGUAGE) => {
    const category = await Category.findById(categoryId).lean();

    if (!category) {
        throw createHttpError(404, "errors.category_not_found");
    }

    const [localizedCategory] = await hydrateCategoryTranslations([category], language);
    return mapCategoryResponse(localizedCategory);
};

export const createCategory = async (payload, actor = null) => {
    const slug = payload.slug ?? toSlug(payload.name);

    if (!slug) {
        throw createHttpError(400, "errors.slug_invalid");
    }

    const existed = await Category.findOne({
        $or: [{ name: payload.name }, { slug }]
    }).lean();

    if (existed) {
        throw createHttpError(409, "errors.category_name_or_slug_duplicate");
    }

    const category = await Category.create({
        name: payload.name,
        slug,
        description: payload.description ?? null,
        icon: payload.icon ?? null
    });

    await upsertDefaultCategoryTranslation(category);
    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.CREATE,
        target_type: ADMIN_LOG_TARGET_TYPE.CATEGORY,
        target_id: category._id,
        meta: {
            name: category.name,
            slug: category.slug
        }
    });

    return mapCategoryResponse(category.toObject());
};

export const updateCategoryById = async (categoryId, payload, actor = null) => {
    const updatePayload = { ...payload };

    if (updatePayload.name && !updatePayload.slug) {
        updatePayload.slug = toSlug(updatePayload.name);
    }

    if (updatePayload.slug !== undefined && !updatePayload.slug) {
        throw createHttpError(400, "errors.slug_invalid");
    }

    if (updatePayload.name) {
        const existedName = await Category.findOne({
            name: updatePayload.name,
            _id: { $ne: categoryId }
        }).lean();

        if (existedName) {
            throw createHttpError(409, "errors.category_name_duplicate");
        }
    }

    if (updatePayload.slug) {
        const existedSlug = await Category.findOne({
            slug: updatePayload.slug,
            _id: { $ne: categoryId }
        }).lean();

        if (existedSlug) {
            throw createHttpError(409, "errors.category_slug_duplicate");
        }
    }

    const category = await Category.findByIdAndUpdate(
        categoryId,
        updatePayload,
        { returnDocument: "after" }
    );

    if (!category) {
        throw createHttpError(404, "errors.category_not_found");
    }

    await upsertDefaultCategoryTranslation(category);
    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.UPDATE,
        target_type: ADMIN_LOG_TARGET_TYPE.CATEGORY,
        target_id: category._id,
        meta: {
            updated_fields: Object.keys(payload || {})
        }
    });

    return mapCategoryResponse(category.toObject());
};

export const deleteCategoryById = async (categoryId, actor = null) => {
    const isCategoryInUse = await Fact.exists({ category_id: categoryId });
    if (isCategoryInUse) {
        throw createHttpError(409, "errors.category_in_use");
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
        throw createHttpError(404, "errors.category_not_found");
    }

    await CategoryTranslation.deleteMany({ category_id: category._id });
    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.DELETE,
        target_type: ADMIN_LOG_TARGET_TYPE.CATEGORY,
        target_id: category._id,
        meta: {
            name: category.name,
            slug: category.slug
        }
    });

    return mapCategoryResponse(category.toObject());
};

export const upsertCategoryTranslationById = async (categoryId, language, payload) => {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw createHttpError(400, "errors.id_invalid");
    }

    const normalizedLanguage = normalizeLanguage(language);
    if (!normalizedLanguage) {
        throw createHttpError(400, "errors.language_invalid_vi_en");
    }

    const category = await Category.findById(categoryId);
    if (!category) {
        throw createHttpError(404, "errors.category_not_found");
    }

    if (normalizedLanguage === DEFAULT_LANGUAGE) {
        category.name = payload.name;
        category.description = payload.description ?? null;
        await category.save();
    }

    const translation = await CategoryTranslation.findOneAndUpdate(
        {
            category_id: category._id,
            language: normalizedLanguage
        },
        {
            $set: {
                name: payload.name,
                description: payload.description ?? null
            }
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    ).lean();

    return mapCategoryTranslationResponse(translation);
};
