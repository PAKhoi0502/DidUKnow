import mongoose from "mongoose";
import Comment from "./comment.model.js";
import Fact from "../fact/fact.model.js";
import Role from "../role/role.model.js";
import { createHttpError } from "../../utils/httpError.js";

const FACT_STATUS_PUBLISHED = "published";
const LIST_DEFAULT_PAGE = 1;
const LIST_DEFAULT_LIMIT = 10;
const LIST_MAX_LIMIT = 50;

const parsePositiveInt = (rawValue, fallback) => {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
};

const normalizePagination = (query = {}) => {
    const page = parsePositiveInt(query.page, LIST_DEFAULT_PAGE);
    const requestedLimit = parsePositiveInt(query.limit, LIST_DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, LIST_MAX_LIMIT);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const ensureValidObjectId = (value, fieldName = "id") => {
    if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
        if (fieldName === "fact_id") {
            throw createHttpError(400, "errors.fact_id_invalid");
        }
        throw createHttpError(400, "errors.id_invalid");
    }
};

const mapCommentResponse = (commentDoc) => {
    return {
        id: commentDoc._id,
        user_id: commentDoc.user_id,
        fact_id: commentDoc.fact_id,
        content: commentDoc.content,
        created_at: commentDoc.created_at
    };
};

const getActorRoleName = async (actor) => {
    if (!actor || !actor.role_id || !mongoose.Types.ObjectId.isValid(String(actor.role_id))) {
        return null;
    }

    const role = await Role.findById(actor.role_id).select("name status").lean();
    if (!role || role.status !== "active") {
        return null;
    }

    return String(role.name || "").trim().toLowerCase();
};

const isActorAdmin = async (actor) => {
    const roleName = await getActorRoleName(actor);
    return roleName === "admin";
};

const isOwner = (commentDoc, actor) => {
    if (!actor?.id || !commentDoc?.user_id) {
        return false;
    }

    return String(commentDoc.user_id) === String(actor.id);
};

export const createComment = async (userId, payload) => {
    ensureValidObjectId(userId, "user_id");
    ensureValidObjectId(payload.fact_id, "fact_id");

    const fact = await Fact.findById(payload.fact_id).select("_id status").lean();
    if (!fact || fact.status !== FACT_STATUS_PUBLISHED) {
        throw createHttpError(404, "errors.fact_not_found");
    }

    const comment = await Comment.create({
        user_id: userId,
        fact_id: payload.fact_id,
        content: payload.content
    });

    return mapCommentResponse(comment.toObject());
};

export const getCommentsByFactId = async (factId, query = {}) => {
    ensureValidObjectId(factId, "fact_id");
    const fact = await Fact.findById(factId).select("_id status").lean();
    if (!fact || fact.status !== FACT_STATUS_PUBLISHED) {
        throw createHttpError(404, "errors.fact_not_found");
    }

    const { page, limit, skip } = normalizePagination(query);
    const filter = { fact_id: factId };

    const [items, total] = await Promise.all([
        Comment.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Comment.countDocuments(filter)
    ]);

    return {
        items: items.map(mapCommentResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const getMyComments = async (userId, query = {}) => {
    ensureValidObjectId(userId, "user_id");
    const { page, limit, skip } = normalizePagination(query);
    const filter = { user_id: userId };

    const [items, total] = await Promise.all([
        Comment.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Comment.countDocuments(filter)
    ]);

    return {
        items: items.map(mapCommentResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const updateCommentById = async (commentId, payload, actor) => {
    ensureValidObjectId(commentId, "id");
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw createHttpError(404, "errors.comment_not_found");
    }

    const canUpdate = isOwner(comment, actor) || await isActorAdmin(actor);
    if (!canUpdate) {
        throw createHttpError(403, "errors.forbidden");
    }

    comment.content = payload.content;
    await comment.save();
    return mapCommentResponse(comment.toObject());
};

export const deleteCommentById = async (commentId, actor) => {
    ensureValidObjectId(commentId, "id");
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw createHttpError(404, "errors.comment_not_found");
    }

    const canDelete = isOwner(comment, actor) || await isActorAdmin(actor);
    if (!canDelete) {
        throw createHttpError(403, "errors.forbidden");
    }

    await comment.deleteOne();
    return mapCommentResponse(comment.toObject());
};

export const deleteCommentsByFactId = async (factId) => {
    if (!mongoose.Types.ObjectId.isValid(String(factId))) {
        return;
    }
    await Comment.deleteMany({ fact_id: factId });
};
