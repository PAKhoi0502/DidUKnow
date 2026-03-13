import Tag from "./tag.model.js";
import Fact from "../fact/fact.model.js";
import { logAdminAction } from "../adminLog/adminLog.service.js";
import { ADMIN_LOG_ACTION, ADMIN_LOG_TARGET_TYPE } from "../adminLog/adminLog.model.js";
import { createHttpError } from "../../utils/httpError.js";

const toSlug = (value) => {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const mapTagResponse = (tagDoc) => {
    return {
        id: tagDoc._id,
        name: tagDoc.name,
        slug: tagDoc.slug,
        created_at: tagDoc.created_at,
        updated_at: tagDoc.updated_at
    };
};

export const getAllTags = async () => {
    const tags = await Tag.find({})
        .sort({ created_at: -1 })
        .lean();

    return tags.map(mapTagResponse);
};

export const getTagById = async (tagId) => {
    const tag = await Tag.findById(tagId).lean();
    if (!tag) {
        throw createHttpError(404, "errors.tag_not_found");
    }

    return mapTagResponse(tag);
};

export const createTag = async (payload, actor = null) => {
    const slug = payload.slug ?? toSlug(payload.name);
    if (!slug) {
        throw createHttpError(400, "errors.slug_invalid");
    }

    const existed = await Tag.findOne({
        $or: [{ name: payload.name }, { slug }]
    }).lean();
    if (existed) {
        throw createHttpError(409, "errors.tag_name_or_slug_duplicate");
    }

    const tag = await Tag.create({
        name: payload.name,
        slug
    });

    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.CREATE,
        target_type: ADMIN_LOG_TARGET_TYPE.TAG,
        target_id: tag._id,
        meta: {
            name: tag.name,
            slug: tag.slug
        }
    });

    return mapTagResponse(tag.toObject());
};

export const updateTagById = async (tagId, payload, actor = null) => {
    const updatePayload = { ...payload };

    if (updatePayload.name && !updatePayload.slug) {
        updatePayload.slug = toSlug(updatePayload.name);
    }

    if (updatePayload.slug !== undefined && !updatePayload.slug) {
        throw createHttpError(400, "errors.slug_invalid");
    }

    if (updatePayload.name) {
        const existedName = await Tag.findOne({
            name: updatePayload.name,
            _id: { $ne: tagId }
        }).lean();

        if (existedName) {
            throw createHttpError(409, "errors.tag_name_duplicate");
        }
    }

    if (updatePayload.slug) {
        const existedSlug = await Tag.findOne({
            slug: updatePayload.slug,
            _id: { $ne: tagId }
        }).lean();

        if (existedSlug) {
            throw createHttpError(409, "errors.tag_slug_duplicate");
        }
    }

    const tag = await Tag.findByIdAndUpdate(
        tagId,
        updatePayload,
        { returnDocument: "after" }
    );

    if (!tag) {
        throw createHttpError(404, "errors.tag_not_found");
    }

    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.UPDATE,
        target_type: ADMIN_LOG_TARGET_TYPE.TAG,
        target_id: tag._id,
        meta: {
            updated_fields: Object.keys(payload || {})
        }
    });

    return mapTagResponse(tag.toObject());
};

export const deleteTagById = async (tagId, actor = null) => {
    const isTagInUse = await Fact.exists({ tag_ids: tagId });
    if (isTagInUse) {
        throw createHttpError(409, "errors.tag_in_use");
    }

    const tag = await Tag.findByIdAndDelete(tagId);
    if (!tag) {
        throw createHttpError(404, "errors.tag_not_found");
    }

    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.DELETE,
        target_type: ADMIN_LOG_TARGET_TYPE.TAG,
        target_id: tag._id,
        meta: {
            name: tag.name,
            slug: tag.slug
        }
    });

    return mapTagResponse(tag.toObject());
};
