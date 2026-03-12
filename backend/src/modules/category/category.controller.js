import {
    createCategory,
    deleteCategoryById,
    getAllCategories,
    getCategoryById,
    upsertCategoryTranslationById,
    updateCategoryById
} from "./category.service.js";

export const getCategoriesController = async (req, res, next) => {
    try {
        const categories = await getAllCategories(req.language);
        return res.status(200).json({
            message: "categories.get_success",
            data: categories
        });
    } catch (error) {
        return next(error);
    }
};

export const getCategoryByIdController = async (req, res, next) => {
    try {
        const category = await getCategoryById(req.params.id, req.language);
        return res.status(200).json({
            message: "categories.get_by_id_success",
            data: category
        });
    } catch (error) {
        return next(error);
    }
};

export const createCategoryController = async (req, res, next) => {
    try {
        const category = await createCategory(req.validatedBody);
        return res.status(201).json({
            message: "categories.create_success",
            data: category
        });
    } catch (error) {
        return next(error);
    }
};

export const updateCategoryController = async (req, res, next) => {
    try {
        const category = await updateCategoryById(req.params.id, req.validatedBody);
        return res.status(200).json({
            message: "categories.update_success",
            data: category
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteCategoryController = async (req, res, next) => {
    try {
        const category = await deleteCategoryById(req.params.id);
        return res.status(200).json({
            message: "categories.delete_success",
            data: category
        });
    } catch (error) {
        return next(error);
    }
};

export const upsertCategoryTranslationController = async (req, res, next) => {
    try {
        const translation = await upsertCategoryTranslationById(
            req.params.id,
            req.params.language,
            req.validatedBody
        );

        return res.status(200).json({
            message: "categories.upsert_translation_success",
            data: translation
        });
    } catch (error) {
        return next(error);
    }
};
