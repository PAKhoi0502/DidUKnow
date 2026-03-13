import mongoose from "mongoose";
import BookmarkCollection from "./bookmarkCollection.model.js";
import { deleteCollectionFactsByCollectionId } from "../collectionFact/collectionFact.service.js";
import { createHttpError } from "../../utils/httpError.js";

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
        if (fieldName === "user_id") {
            throw createHttpError(400, "errors.user_id_invalid");
        }
        throw createHttpError(400, "errors.id_invalid");
    }
};

const mapBookmarkCollectionResponse = (doc) => {
    return {
        id: doc._id,
        user_id: doc.user_id,
        name: doc.name,
        created_at: doc.created_at,
        updated_at: doc.updated_at
    };
};

export const createBookmarkCollection = async (userId, payload) => {
    ensureValidObjectId(userId, "user_id");

    const existed = await BookmarkCollection.findOne({
        user_id: userId,
        name: payload.name
    }).lean();

    if (existed) {
        throw createHttpError(409, "errors.bookmark_collection_name_duplicate");
    }

    const collection = await BookmarkCollection.create({
        user_id: userId,
        name: payload.name
    });

    return mapBookmarkCollectionResponse(collection.toObject());
};

export const getMyBookmarkCollections = async (userId, query = {}) => {
    ensureValidObjectId(userId, "user_id");
    const { page, limit, skip } = normalizePagination(query);
    const filter = { user_id: userId };

    const [items, total] = await Promise.all([
        BookmarkCollection.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        BookmarkCollection.countDocuments(filter)
    ]);

    return {
        items: items.map(mapBookmarkCollectionResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const getMyBookmarkCollectionById = async (collectionId, userId) => {
    ensureValidObjectId(collectionId, "id");
    ensureValidObjectId(userId, "user_id");

    const collection = await BookmarkCollection.findOne({
        _id: collectionId,
        user_id: userId
    }).lean();

    if (!collection) {
        throw createHttpError(404, "errors.bookmark_collection_not_found");
    }

    return mapBookmarkCollectionResponse(collection);
};

export const updateMyBookmarkCollectionById = async (collectionId, userId, payload) => {
    ensureValidObjectId(collectionId, "id");
    ensureValidObjectId(userId, "user_id");

    const collection = await BookmarkCollection.findOne({
        _id: collectionId,
        user_id: userId
    });

    if (!collection) {
        throw createHttpError(404, "errors.bookmark_collection_not_found");
    }

    if (payload.name !== undefined && payload.name !== collection.name) {
        const existed = await BookmarkCollection.findOne({
            user_id: userId,
            name: payload.name,
            _id: { $ne: collectionId }
        }).lean();

        if (existed) {
            throw createHttpError(409, "errors.bookmark_collection_name_duplicate");
        }
        collection.name = payload.name;
    }

    await collection.save();
    return mapBookmarkCollectionResponse(collection.toObject());
};

export const deleteMyBookmarkCollectionById = async (collectionId, userId) => {
    ensureValidObjectId(collectionId, "id");
    ensureValidObjectId(userId, "user_id");

    const collection = await BookmarkCollection.findOneAndDelete({
        _id: collectionId,
        user_id: userId
    });

    if (!collection) {
        throw createHttpError(404, "errors.bookmark_collection_not_found");
    }

    await deleteCollectionFactsByCollectionId(String(collection._id));
    return mapBookmarkCollectionResponse(collection.toObject());
};
