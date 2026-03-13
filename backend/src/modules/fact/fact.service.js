import mongoose from "mongoose";
import Fact from "./fact.model.js";
import FactTranslation from "./factTranslation.model.js";
import FactRandomSession from "./factRandomSession.model.js";
import Favourite from "../favourite/favourite.model.js";
import { recordFactView } from "../factView/factView.service.js";
import { deleteReportFactsByFactId } from "../reportFact/reportFact.service.js";
import { deleteCommentsByFactId } from "../comment/comment.service.js";
import { deleteCollectionFactsByFactId } from "../collectionFact/collectionFact.service.js";
import { logAdminAction } from "../adminLog/adminLog.service.js";
import { ADMIN_LOG_ACTION, ADMIN_LOG_TARGET_TYPE } from "../adminLog/adminLog.model.js";
import Role from "../role/role.model.js";
import { createHttpError } from "../../utils/httpError.js";
import { DEFAULT_LANGUAGE, normalizeLanguage } from "../../config/i18n.js";

const FACT_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published"
};

const FACT_ALLOWED_STATUSES = [FACT_STATUS.DRAFT, FACT_STATUS.PUBLISHED];
const LIST_DEFAULT_PAGE = 1;
const LIST_DEFAULT_LIMIT = 10;
const LIST_MAX_LIMIT = 50;

export const mapFactResponse = (factDoc) => {
    return {
        id: factDoc._id,
        title: factDoc.title,
        short_fact: factDoc.short_fact,
        content: factDoc.content,
        category_id: factDoc.category_id,
        tag_ids: Array.isArray(factDoc.tag_ids) ? factDoc.tag_ids : [],
        status: factDoc.status,
        created_by: factDoc.created_by,
        created_at: factDoc.created_at,
        updated_at: factDoc.updated_at
    };
};

const mapFactTranslationResponse = (translationDoc) => {
    return {
        id: translationDoc._id,
        fact_id: translationDoc.fact_id,
        language: translationDoc.language,
        title: translationDoc.title,
        short_fact: translationDoc.short_fact,
        content: translationDoc.content,
        created_at: translationDoc.created_at,
        updated_at: translationDoc.updated_at
    };
};

const getPreferredLanguage = (language) => {
    return normalizeLanguage(language) ?? DEFAULT_LANGUAGE;
};

const mergeTranslatedImages = (sourceImages, translatedImages) => {
    const baseImages = Array.isArray(sourceImages) ? sourceImages : [];
    const localizedImages = Array.isArray(translatedImages) ? translatedImages : [];

    if (baseImages.length === 0) {
        return localizedImages;
    }

    return baseImages.map((baseImage, index) => {
        const localizedImage = localizedImages[index];
        if (!localizedImage || typeof localizedImage !== "object") {
            return baseImage;
        }

        return {
            ...baseImage,
            url: baseImage?.url ?? localizedImage?.url ?? null,
            ...(localizedImage.alt !== undefined ? { alt: localizedImage.alt } : {}),
            ...(localizedImage.caption !== undefined ? { caption: localizedImage.caption } : {})
        };
    });
};

const applyFactTranslation = (factDoc, translationDoc) => {
    if (!translationDoc) {
        return factDoc;
    }

    const factContent = factDoc?.content || {};
    const translationContent = translationDoc?.content || {};

    return {
        ...factDoc,
        title: translationDoc.title ?? factDoc.title,
        short_fact: translationDoc.short_fact ?? factDoc.short_fact,
        content: {
            intro: translationContent.intro ?? factContent.intro,
            body: translationContent.body ?? factContent.body,
            conclusion: translationContent.conclusion ?? factContent.conclusion,
            images: mergeTranslatedImages(factContent.images, translationContent.images)
        }
    };
};

const hydrateFactTranslations = async (factDocs, language) => {
    if (!Array.isArray(factDocs) || factDocs.length === 0) {
        return [];
    }

    const preferredLanguage = getPreferredLanguage(language);
    const factIds = factDocs.map((fact) => fact._id);
    const translations = await FactTranslation.find({
        fact_id: { $in: factIds },
        language: { $in: [preferredLanguage, DEFAULT_LANGUAGE] }
    }).lean();

    const translationByFactId = new Map();
    for (const translation of translations) {
        const key = translation.fact_id.toString();
        const existing = translationByFactId.get(key);

        if (!existing) {
            translationByFactId.set(key, translation);
            continue;
        }

        if (existing.language !== preferredLanguage && translation.language === preferredLanguage) {
            translationByFactId.set(key, translation);
        }
    }

    return factDocs.map((fact) => {
        const translation = translationByFactId.get(fact._id.toString());
        return applyFactTranslation(fact, translation);
    });
};

const upsertDefaultFactTranslation = async (factDoc) => {
    await FactTranslation.findOneAndUpdate(
        {
            fact_id: factDoc._id,
            language: DEFAULT_LANGUAGE
        },
        {
            $set: {
                title: factDoc.title,
                short_fact: factDoc.short_fact,
                content: factDoc.content
            }
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    );
};

const isValidObjectId = (value) => {
    return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
};

const parseExcludedFactIds = (query = {}) => {
    const rawIds = [];

    if (query.exclude_id !== undefined) {
        rawIds.push(query.exclude_id);
    }

    if (query.exclude_ids !== undefined) {
        if (Array.isArray(query.exclude_ids)) {
            rawIds.push(...query.exclude_ids);
        } else {
            rawIds.push(...String(query.exclude_ids).split(","));
        }
    }

    const uniqueIds = [...new Set(
        rawIds
            .map((value) => String(value || "").trim())
            .filter(Boolean)
    )];

    if (uniqueIds.some((id) => !isValidObjectId(id))) {
        throw createHttpError(400, "exclude_id must be a valid ObjectId");
    }

    return uniqueIds;
};

const parseTagFilterIds = (query = {}) => {
    const rawTagIds = [];

    if (query.tag_id !== undefined) {
        rawTagIds.push(query.tag_id);
    }

    if (query.tag_ids !== undefined) {
        if (Array.isArray(query.tag_ids)) {
            rawTagIds.push(...query.tag_ids);
        } else {
            rawTagIds.push(...String(query.tag_ids).split(","));
        }
    }

    const normalizedTagIds = [...new Set(
        rawTagIds
            .map((value) => String(value || "").trim())
            .filter(Boolean)
    )];

    if (normalizedTagIds.some((id) => !isValidObjectId(id))) {
        throw createHttpError(400, "tag_id and tag_ids must be valid ObjectId values");
    }

    return normalizedTagIds;
};

const buildRandomSessionScopeKey = (userId, categoryId = null, tagScope = null) => {
    return `${userId}:${categoryId || "all"}:${tagScope || "all-tags"}`;
};

const drawRandomFactFromPool = async (poolIds, filter) => {
    const remaining = Array.isArray(poolIds) ? [...poolIds] : [];

    while (remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length);
        const selectedId = remaining.splice(randomIndex, 1)[0];
        const fact = await Fact.findOne({
            ...filter,
            _id: selectedId
        }).lean();

        if (fact) {
            return {
                fact,
                remaining
            };
        }
    }

    return {
        fact: null,
        remaining: []
    };
};

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

const getActorRoleName = async (actor) => {
    if (!actor) {
        return null;
    }

    if (typeof actor.role_name === "string" && actor.role_name.trim().length > 0) {
        return actor.role_name.trim().toLowerCase();
    }

    if (!isValidObjectId(actor.role_id)) {
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

const isActorAdminOrEditor = async (actor) => {
    const roleName = await getActorRoleName(actor);
    return roleName === "admin" || roleName === "editor";
};

const isOwner = (factDoc, actor) => {
    if (!actor?.id || !factDoc?.created_by) {
        return false;
    }
    return factDoc.created_by.toString() === String(actor.id);
};

const ensureFactId = (factId) => {
    if (!isValidObjectId(factId)) {
        throw createHttpError(400, "fact_id must be a valid ObjectId");
    }
};

const ensureAuthenticatedActor = (actor) => {
    if (!actor?.id) {
        throw createHttpError(401, "Unauthorized");
    }
};

const safeRecordFactView = async (factId, viewer = null) => {
    try {
        await recordFactView({
            factId: String(factId),
            userId: viewer?.user_id ? String(viewer.user_id) : null,
            ipAddress: viewer?.ip_address ?? null
        });
    } catch (error) {
        // Tracking errors should not break fact read APIs.
        console.error(error);
    }
};

export const createFact = async (payload, actorUserId) => {
    if (!isValidObjectId(actorUserId)) {
        throw createHttpError(401, "Unauthorized");
    }

    const fact = await Fact.create({
        title: payload.title,
        short_fact: payload.short_fact,
        content: payload.content,
        category_id: payload.category_id,
        tag_ids: payload.tag_ids ?? [],
        created_by: actorUserId,
        status: FACT_STATUS.DRAFT
    });

    await upsertDefaultFactTranslation(fact);

    return mapFactResponse(fact.toObject());
};

export const getFactList = async (query = {}, actor = null, language = DEFAULT_LANGUAGE) => {
    const { page, limit, skip } = normalizePagination(query);
    const canFilterStatus = await isActorAdminOrEditor(actor);
    const filter = {};
    const tagFilterIds = parseTagFilterIds(query);

    if (canFilterStatus) {
        if (query.status !== undefined) {
            if (!FACT_ALLOWED_STATUSES.includes(query.status)) {
                throw createHttpError(400, "status must be one of: draft, published");
            }
            filter.status = query.status;
        }
    } else {
        filter.status = FACT_STATUS.PUBLISHED;
    }

    if (query.category_id !== undefined) {
        if (!isValidObjectId(query.category_id)) {
            throw createHttpError(400, "category_id must be a valid ObjectId");
        }
        filter.category_id = query.category_id;
    }

    if (tagFilterIds.length > 0) {
        filter.tag_ids = {
            $in: tagFilterIds.map((tagId) => new mongoose.Types.ObjectId(tagId))
        };
    }

    const searchValue = typeof query.search === "string" ? query.search.trim() : "";
    if (searchValue.length > 0) {
        filter.$text = { $search: searchValue };
    }

    const sort = searchValue.length > 0
        ? { score: { $meta: "textScore" }, created_at: -1 }
        : { created_at: -1 };

    const [items, total] = await Promise.all([
        Fact.find(filter)
            .select(searchValue.length > 0 ? { score: { $meta: "textScore" } } : {})
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Fact.countDocuments(filter)
    ]);

    const localizedItems = await hydrateFactTranslations(items, language);

    return {
        items: localizedItems.map(mapFactResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const getRandomFact = async (query = {}, language = DEFAULT_LANGUAGE, actor = null, viewer = null) => {
    const filter = {
        status: FACT_STATUS.PUBLISHED
    };
    const tagFilterIds = parseTagFilterIds(query);

    if (query.category_id !== undefined) {
        if (!isValidObjectId(query.category_id)) {
            throw createHttpError(400, "category_id must be a valid ObjectId");
        }
        filter.category_id = new mongoose.Types.ObjectId(query.category_id);
    }

    if (tagFilterIds.length > 0) {
        filter.tag_ids = {
            $in: tagFilterIds.map((tagId) => new mongoose.Types.ObjectId(tagId))
        };
    }

    const excludedIds = parseExcludedFactIds(query);
    const isAuthenticated = Boolean(actor?.id && isValidObjectId(String(actor.id)));

    if (!isAuthenticated) {
        if (excludedIds.length > 0) {
            filter._id = {
                $nin: excludedIds.map((id) => new mongoose.Types.ObjectId(id))
            };
        }

        const [fact] = await Fact.aggregate([
            { $match: filter },
            { $sample: { size: 1 } }
        ]);

        if (!fact) {
            throw createHttpError(404, "Fact not found");
        }

        const [localizedFact] = await hydrateFactTranslations([fact], language);
        await safeRecordFactView(localizedFact._id, viewer);
        return {
            fact: mapFactResponse(localizedFact),
            meta: {
                cycle_reset: false,
                remaining_in_cycle: null
            }
        };
    }

    const userId = String(actor.id);
    const categoryId = filter.category_id ? String(filter.category_id) : null;
    const tagScope = tagFilterIds.length > 0 ? tagFilterIds.slice().sort().join(",") : null;
    const scopeKey = buildRandomSessionScopeKey(userId, categoryId, tagScope);

    let cycleReset = false;
    let session = await FactRandomSession.findOne({ scope_key: scopeKey });
    const sessionExisted = Boolean(session);

    if (!session) {
        session = await FactRandomSession.create({
            scope_key: scopeKey,
            user_id: userId,
            category_id: categoryId,
            remaining_fact_ids: []
        });
    }

    let poolIds = Array.isArray(session.remaining_fact_ids)
        ? session.remaining_fact_ids.map((id) => String(id))
        : [];

    if (poolIds.length === 0) {
        const candidateFacts = await Fact.find(filter).select("_id").lean();
        if (candidateFacts.length === 0) {
            throw createHttpError(404, "Fact not found");
        }
        poolIds = candidateFacts.map((item) => String(item._id));
        cycleReset = sessionExisted;
    }

    let drawResult = await drawRandomFactFromPool(poolIds, filter);

    if (!drawResult.fact) {
        const candidateFacts = await Fact.find(filter).select("_id").lean();
        if (candidateFacts.length === 0) {
            session.remaining_fact_ids = [];
            await session.save();
            throw createHttpError(404, "Fact not found");
        }

        cycleReset = true;
        poolIds = candidateFacts.map((item) => String(item._id));
        drawResult = await drawRandomFactFromPool(poolIds, filter);
    }

    if (!drawResult.fact) {
        session.remaining_fact_ids = [];
        await session.save();
        throw createHttpError(404, "Fact not found");
    }

    session.remaining_fact_ids = drawResult.remaining;
    await session.save();

    const [localizedFact] = await hydrateFactTranslations([drawResult.fact], language);
    await safeRecordFactView(localizedFact._id, viewer);
    return {
        fact: mapFactResponse(localizedFact),
        meta: {
            cycle_reset: cycleReset,
            remaining_in_cycle: drawResult.remaining.length
        }
    };
};

export const getFactById = async (factId, actor = null, language = DEFAULT_LANGUAGE, viewer = null) => {
    ensureFactId(factId);

    const fact = await Fact.findById(factId).lean();
    if (!fact) {
        throw createHttpError(404, "Fact not found");
    }

    if (fact.status === FACT_STATUS.PUBLISHED) {
        const [localizedFact] = await hydrateFactTranslations([fact], language);
        await safeRecordFactView(localizedFact._id, viewer);
        return mapFactResponse(localizedFact);
    }

    if (!actor?.id) {
        throw createHttpError(404, "Fact not found");
    }

    const canViewDraft = isOwner(fact, actor) || await isActorAdminOrEditor(actor);
    if (!canViewDraft) {
        throw createHttpError(403, "Forbidden");
    }

    const [localizedFact] = await hydrateFactTranslations([fact], language);
    return mapFactResponse(localizedFact);
};

export const updateFactById = async (factId, payload, actor) => {
    ensureFactId(factId);
    ensureAuthenticatedActor(actor);

    if (payload.status !== undefined) {
        throw createHttpError(400, "status cannot be updated in this endpoint");
    }

    if (payload.created_by !== undefined) {
        throw createHttpError(400, "created_by cannot be updated");
    }

    const allowedFields = ["title", "short_fact", "content", "category_id", "tag_ids"];
    const payloadKeys = Object.keys(payload || {});
    const invalidFields = payloadKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        throw createHttpError(400, `Invalid fields: ${invalidFields.join(", ")}`);
    }

    if (payloadKeys.length === 0) {
        throw createHttpError(400, "At least one field is required for update");
    }

    if (payload.category_id !== undefined && !isValidObjectId(payload.category_id)) {
        throw createHttpError(400, "category_id must be a valid ObjectId");
    }

    if (payload.tag_ids !== undefined) {
        if (!Array.isArray(payload.tag_ids)) {
            throw createHttpError(400, "tag_ids must be an array of valid ObjectId values");
        }

        const normalizedTagIds = [...new Set(
            payload.tag_ids
                .map((value) => String(value || "").trim())
                .filter(Boolean)
        )];

        if (normalizedTagIds.some((id) => !isValidObjectId(id))) {
            throw createHttpError(400, "tag_ids must contain valid ObjectId values");
        }

        payload.tag_ids = normalizedTagIds;
    }

    const fact = await Fact.findById(factId);
    if (!fact) {
        throw createHttpError(404, "Fact not found");
    }

    const canUpdate = isOwner(fact, actor) || await isActorAdmin(actor);
    if (!canUpdate) {
        throw createHttpError(403, "Forbidden");
    }

    if (payload.title !== undefined) fact.title = payload.title;
    if (payload.short_fact !== undefined) fact.short_fact = payload.short_fact;
    if (payload.content !== undefined) fact.content = payload.content;
    if (payload.category_id !== undefined) fact.category_id = payload.category_id;
    if (payload.tag_ids !== undefined) fact.tag_ids = payload.tag_ids;

    await fact.save();
    await upsertDefaultFactTranslation(fact);
    return mapFactResponse(fact.toObject());
};

export const updateFactStatusById = async (factId, status, actor, reason = null) => {
    ensureFactId(factId);
    ensureAuthenticatedActor(actor);

    if (!FACT_ALLOWED_STATUSES.includes(status)) {
        throw createHttpError(400, "status must be one of: draft, published");
    }

    if (reason !== null && reason !== undefined) {
        if (typeof reason !== "string" || reason.trim().length < 3) {
            throw createHttpError(400, "reason must be at least 3 characters");
        }
    }

    const canChangeStatus = await isActorAdmin(actor);
    if (!canChangeStatus) {
        throw createHttpError(403, "Forbidden");
    }

    const fact = await Fact.findByIdAndUpdate(
        factId,
        { status },
        { returnDocument: "after" }
    );

    if (!fact) {
        throw createHttpError(404, "Fact not found");
    }

    await logAdminAction({
        admin: actor,
        action: ADMIN_LOG_ACTION.STATUS_UPDATE,
        target_type: ADMIN_LOG_TARGET_TYPE.FACT,
        target_id: fact._id,
        meta: {
            new_status: status,
            reason: reason ?? null
        }
    });

    return mapFactResponse(fact.toObject());
};

export const deleteFactById = async (factId, actor) => {
    ensureFactId(factId);
    ensureAuthenticatedActor(actor);

    const fact = await Fact.findById(factId);
    if (!fact) {
        throw createHttpError(404, "Fact not found");
    }

    const canDelete = isOwner(fact, actor) || await isActorAdmin(actor);
    if (!canDelete) {
        throw createHttpError(403, "Forbidden");
    }

    await Promise.all([
        fact.deleteOne(),
        FactTranslation.deleteMany({ fact_id: fact._id }),
        Favourite.deleteMany({ fact_id: fact._id }),
        deleteReportFactsByFactId(String(fact._id)),
        deleteCommentsByFactId(String(fact._id)),
        deleteCollectionFactsByFactId(String(fact._id))
    ]);

    return mapFactResponse(fact.toObject());
};

export const upsertFactTranslationById = async (factId, language, payload, actor) => {
    ensureFactId(factId);
    ensureAuthenticatedActor(actor);

    const normalizedLanguage = normalizeLanguage(language);
    if (!normalizedLanguage) {
        throw createHttpError(400, "language must be one of: vi, en");
    }

    const fact = await Fact.findById(factId);
    if (!fact) {
        throw createHttpError(404, "Fact not found");
    }

    const canUpdate = isOwner(fact, actor) || await isActorAdmin(actor);
    if (!canUpdate) {
        throw createHttpError(403, "Forbidden");
    }

    if (normalizedLanguage === DEFAULT_LANGUAGE) {
        fact.title = payload.title;
        fact.short_fact = payload.short_fact;
        fact.content = payload.content;
        await fact.save();
    }

    const translation = await FactTranslation.findOneAndUpdate(
        {
            fact_id: fact._id,
            language: normalizedLanguage
        },
        {
            $set: {
                title: payload.title,
                short_fact: payload.short_fact,
                content: payload.content
            }
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    ).lean();

    return mapFactTranslationResponse(translation);
};
