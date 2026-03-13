import mongoose from "mongoose";
import CollectionFact from "./collectionFact.model.js";
import BookmarkCollection from "../bookmarkCollection/bookmarkCollection.model.js";
import Fact from "../fact/fact.model.js";
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
        if (fieldName === "collection_id") {
            throw createHttpError(400, "errors.collection_id_invalid");
        }
        if (fieldName === "user_id") {
            throw createHttpError(400, "errors.user_id_invalid");
        }
        throw createHttpError(400, "errors.id_invalid");
    }
};

const mapCollectionFactResponse = (doc) => {
    return {
        id: doc._id,
        collection_id: doc.collection_id,
        fact_id: doc.fact_id,
        created_at: doc.created_at
    };
};

const ensureCollectionOwnership = async (collectionId, userId) => {
    const collection = await BookmarkCollection.findOne({
        _id: collectionId,
        user_id: userId
    }).lean();

    if (!collection) {
        throw createHttpError(404, "errors.bookmark_collection_not_found");
    }
};

export const addFactToCollection = async (userId, payload) => {
    ensureValidObjectId(userId, "user_id");
    ensureValidObjectId(payload.collection_id, "collection_id");
    ensureValidObjectId(payload.fact_id, "fact_id");

    await ensureCollectionOwnership(payload.collection_id, userId);

    const fact = await Fact.findById(payload.fact_id).select("_id status").lean();
    if (!fact || fact.status !== FACT_STATUS_PUBLISHED) {
        throw createHttpError(404, "errors.fact_not_found");
    }

    const existed = await CollectionFact.findOne({
        collection_id: payload.collection_id,
        fact_id: payload.fact_id
    }).lean();

    if (existed) {
        throw createHttpError(409, "errors.collection_fact_duplicate");
    }

    const item = await CollectionFact.create({
        collection_id: payload.collection_id,
        fact_id: payload.fact_id
    });

    return mapCollectionFactResponse(item.toObject());
};

export const getCollectionFacts = async (collectionId, userId, query = {}) => {
    ensureValidObjectId(collectionId, "collection_id");
    ensureValidObjectId(userId, "user_id");
    await ensureCollectionOwnership(collectionId, userId);

    const { page, limit, skip } = normalizePagination(query);
    const filter = { collection_id: collectionId };

    const [items, total] = await Promise.all([
        CollectionFact.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        CollectionFact.countDocuments(filter)
    ]);

    return {
        items: items.map(mapCollectionFactResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const removeFactFromCollection = async (collectionId, factId, userId) => {
    ensureValidObjectId(collectionId, "collection_id");
    ensureValidObjectId(factId, "fact_id");
    ensureValidObjectId(userId, "user_id");
    await ensureCollectionOwnership(collectionId, userId);

    const item = await CollectionFact.findOneAndDelete({
        collection_id: collectionId,
        fact_id: factId
    });

    if (!item) {
        throw createHttpError(404, "errors.collection_fact_not_found");
    }

    return mapCollectionFactResponse(item.toObject());
};

export const deleteCollectionFactsByCollectionId = async (collectionId) => {
    if (!mongoose.Types.ObjectId.isValid(String(collectionId))) {
        return;
    }
    await CollectionFact.deleteMany({ collection_id: collectionId });
};

export const deleteCollectionFactsByFactId = async (factId) => {
    if (!mongoose.Types.ObjectId.isValid(String(factId))) {
        return;
    }
    await CollectionFact.deleteMany({ fact_id: factId });
};
