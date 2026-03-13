import {
    createTag,
    deleteTagById,
    getAllTags,
    getTagById,
    updateTagById
} from "./tag.service.js";

export const getTagsController = async (req, res, next) => {
    try {
        const tags = await getAllTags();
        return res.status(200).json({
            message: "tags.get_success",
            data: tags
        });
    } catch (error) {
        return next(error);
    }
};

export const getTagByIdController = async (req, res, next) => {
    try {
        const tag = await getTagById(req.params.id);
        return res.status(200).json({
            message: "tags.get_by_id_success",
            data: tag
        });
    } catch (error) {
        return next(error);
    }
};

export const createTagController = async (req, res, next) => {
    try {
        const tag = await createTag(req.validatedBody);
        return res.status(201).json({
            message: "tags.create_success",
            data: tag
        });
    } catch (error) {
        return next(error);
    }
};

export const updateTagController = async (req, res, next) => {
    try {
        const tag = await updateTagById(req.params.id, req.validatedBody);
        return res.status(200).json({
            message: "tags.update_success",
            data: tag
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteTagController = async (req, res, next) => {
    try {
        const tag = await deleteTagById(req.params.id);
        return res.status(200).json({
            message: "tags.delete_success",
            data: tag
        });
    } catch (error) {
        return next(error);
    }
};
