import mongoose from "mongoose";
import Favourite from "./favourite.model.js";
import Fact from "../fact/fact.model.js";
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

const ensureValidObjectId = (value, fieldName) => {
    if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
        if (fieldName === "fact_id") {
            throw createHttpError(400, "fact_id must be a valid ObjectId");
        }
        throw createHttpError(400, "id must be a valid ObjectId");
    }
};

const mapFavouriteResponse = (favouriteDoc) => {
    return {
        id: favouriteDoc._id,
        user_id: favouriteDoc.user_id,
        fact_id: favouriteDoc.fact_id,
        created_at: favouriteDoc.created_at,
        updated_at: favouriteDoc.updated_at
    };
};

export const addFavourite = async (userId, factId) => {
    ensureValidObjectId(userId, "user_id");
    ensureValidObjectId(factId, "fact_id");

    const fact = await Fact.findById(factId).select("_id status").lean();
    if (!fact || fact.status !== "published") {
        throw createHttpError(404, "Fact not found");
    }

    const existed = await Favourite.findOne({
        user_id: userId,
        fact_id: factId
    }).lean();

    if (existed) {
        throw createHttpError(409, "errors.favourite_already_exists");
    }

    const favourite = await Favourite.create({
        user_id: userId,
        fact_id: factId
    });

    return mapFavouriteResponse(favourite.toObject());
};

export const removeFavouriteByFactId = async (userId, factId) => {
    ensureValidObjectId(userId, "user_id");
    ensureValidObjectId(factId, "fact_id");

    const favourite = await Favourite.findOneAndDelete({
        user_id: userId,
        fact_id: factId
    });

    if (!favourite) {
        throw createHttpError(404, "errors.favourite_not_found");
    }

    return mapFavouriteResponse(favourite.toObject());
};

export const checkFavouriteByFactId = async (userId, factId) => {
    ensureValidObjectId(userId, "user_id");
    ensureValidObjectId(factId, "fact_id");

    const existed = await Favourite.exists({
        user_id: userId,
        fact_id: factId
    });

    return {
        fact_id: factId,
        is_favourited: Boolean(existed)
    };
};

export const getFavouriteList = async (userId, query = {}) => {
    ensureValidObjectId(userId, "user_id");
    const { page, limit, skip } = normalizePagination(query);

    const [items, total] = await Promise.all([
        Favourite.find({ user_id: userId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Favourite.countDocuments({ user_id: userId })
    ]);

    return {
        items: items.map(mapFavouriteResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};
