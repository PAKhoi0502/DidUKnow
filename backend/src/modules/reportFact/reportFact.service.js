import mongoose from "mongoose";
import Fact from "../fact/fact.model.js";
import ReportFact, { REPORT_FACT_ALLOWED_STATUSES, REPORT_FACT_STATUS } from "./reportFact.model.js";
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
            throw createHttpError(400, "errors.fact_id_invalid");
        }
        if (fieldName === "user_id") {
            throw createHttpError(400, "errors.user_id_invalid");
        }
        throw createHttpError(400, "errors.id_invalid");
    }
};

const mapReportFactResponse = (reportDoc) => {
    return {
        id: reportDoc._id,
        user_id: reportDoc.user_id,
        fact_id: reportDoc.fact_id,
        reason: reportDoc.reason,
        status: reportDoc.status,
        resolved_by: reportDoc.resolved_by,
        resolution_note: reportDoc.resolution_note,
        created_at: reportDoc.created_at,
        updated_at: reportDoc.updated_at
    };
};

export const createReportFact = async (userId, payload) => {
    ensureValidObjectId(userId, "user_id");
    ensureValidObjectId(payload.fact_id, "fact_id");

    const fact = await Fact.findById(payload.fact_id).select("_id").lean();
    if (!fact) {
        throw createHttpError(404, "Fact not found");
    }

    const existingOpenReport = await ReportFact.findOne({
        user_id: userId,
        fact_id: payload.fact_id,
        status: {
            $in: [REPORT_FACT_STATUS.PENDING, REPORT_FACT_STATUS.REVIEWING]
        }
    }).lean();

    if (existingOpenReport) {
        throw createHttpError(409, "errors.report_fact_already_open");
    }

    const report = await ReportFact.create({
        user_id: userId,
        fact_id: payload.fact_id,
        reason: payload.reason,
        status: REPORT_FACT_STATUS.PENDING
    });

    return mapReportFactResponse(report.toObject());
};

export const getMyReportFacts = async (userId, query = {}) => {
    ensureValidObjectId(userId, "user_id");
    const { page, limit, skip } = normalizePagination(query);

    const filter = {
        user_id: userId
    };

    if (query.status !== undefined) {
        if (!REPORT_FACT_ALLOWED_STATUSES.includes(query.status)) {
            throw createHttpError(400, "errors.report_fact_status_invalid");
        }
        filter.status = query.status;
    }

    const [items, total] = await Promise.all([
        ReportFact.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ReportFact.countDocuments(filter)
    ]);

    return {
        items: items.map(mapReportFactResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const getAllReportFacts = async (query = {}) => {
    const { page, limit, skip } = normalizePagination(query);
    const filter = {};

    if (query.status !== undefined) {
        if (!REPORT_FACT_ALLOWED_STATUSES.includes(query.status)) {
            throw createHttpError(400, "errors.report_fact_status_invalid");
        }
        filter.status = query.status;
    }

    if (query.fact_id !== undefined) {
        ensureValidObjectId(query.fact_id, "fact_id");
        filter.fact_id = query.fact_id;
    }

    if (query.user_id !== undefined) {
        ensureValidObjectId(query.user_id, "user_id");
        filter.user_id = query.user_id;
    }

    const [items, total] = await Promise.all([
        ReportFact.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        ReportFact.countDocuments(filter)
    ]);

    return {
        items: items.map(mapReportFactResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const updateReportFactStatusById = async (reportId, payload, actorUserId) => {
    ensureValidObjectId(reportId, "id");
    ensureValidObjectId(actorUserId, "user_id");

    if (!REPORT_FACT_ALLOWED_STATUSES.includes(payload.status)) {
        throw createHttpError(400, "errors.report_fact_status_invalid");
    }

    const report = await ReportFact.findById(reportId);
    if (!report) {
        throw createHttpError(404, "errors.report_fact_not_found");
    }

    report.status = payload.status;
    report.resolved_by = actorUserId;
    report.resolution_note = payload.resolution_note ?? null;
    await report.save();

    return mapReportFactResponse(report.toObject());
};

export const deleteReportFactsByFactId = async (factId) => {
    if (!mongoose.Types.ObjectId.isValid(factId)) {
        return;
    }

    await ReportFact.deleteMany({ fact_id: factId });
};
