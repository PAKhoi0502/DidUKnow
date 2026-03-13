import {
    createComment,
    deleteCommentById,
    getCommentsByFactId,
    getMyComments,
    updateCommentById
} from "./comment.service.js";

export const createCommentController = async (req, res, next) => {
    try {
        const comment = await createComment(req.user.id, req.validatedBody);
        return res.status(201).json({
            message: "comments.create_success",
            data: comment
        });
    } catch (error) {
        return next(error);
    }
};

export const getCommentsByFactIdController = async (req, res, next) => {
    try {
        const comments = await getCommentsByFactId(req.params.fact_id, req.query);
        return res.status(200).json({
            message: "comments.get_success",
            data: comments
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyCommentsController = async (req, res, next) => {
    try {
        const comments = await getMyComments(req.user.id, req.query);
        return res.status(200).json({
            message: "comments.get_my_success",
            data: comments
        });
    } catch (error) {
        return next(error);
    }
};

export const updateCommentController = async (req, res, next) => {
    try {
        const comment = await updateCommentById(req.params.id, req.validatedBody, req.user);
        return res.status(200).json({
            message: "comments.update_success",
            data: comment
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteCommentController = async (req, res, next) => {
    try {
        const comment = await deleteCommentById(req.params.id, req.user);
        return res.status(200).json({
            message: "comments.delete_success",
            data: comment
        });
    } catch (error) {
        return next(error);
    }
};
