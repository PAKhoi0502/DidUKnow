import mongoose from "mongoose";
import AdminLog, {
    ADMIN_LOG_ALLOWED_ACTIONS,
    ADMIN_LOG_ALLOWED_TARGET_TYPES
} from "./adminLog.model.js";
import { createHttpError } from "../../utils/httpError.js";

const LIST_DEFAULT_PAGE = 1;
const LIST_DEFAULT_LIMIT = 20;
const LIST_MAX_LIMIT = 100;

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

const parseOptionalDate = (rawValue) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
        return null;
    }

    const parsed = new Date(String(rawValue));
    if (Number.isNaN(parsed.getTime())) {
        throw createHttpError(400, "errors.date_invalid");
    }

    return parsed;
};

const mapAdminLogResponse = (doc) => {
    return {
        id: doc._id,
        admin_id: doc.admin_id,
        action: doc.action,
        target_type: doc.target_type,
        target_id: doc.target_id,
        meta: doc.meta ?? null,
        created_at: doc.created_at
    };
};

export const createAdminLog = async ({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    meta = null
}) => {
    if (!mongoose.Types.ObjectId.isValid(String(adminId))) {
        throw createHttpError(400, "errors.user_id_invalid");
    }

    if (!ADMIN_LOG_ALLOWED_ACTIONS.includes(action)) {
        throw createHttpError(400, "errors.admin_log_action_invalid");
    }

    if (!ADMIN_LOG_ALLOWED_TARGET_TYPES.includes(targetType)) {
        throw createHttpError(400, "errors.admin_log_target_type_invalid");
    }

    if (!mongoose.Types.ObjectId.isValid(String(targetId))) {
        throw createHttpError(400, "errors.id_invalid");
    }

    const adminLog = await AdminLog.create({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        meta
    });

    return mapAdminLogResponse(adminLog.toObject());
};

export const logAdminAction = async ({
    admin,
    action,
    target_type: targetType,
    target_id: targetId,
    meta = null
}) => {
    if (!admin?.id) {
        return;
    }

    try {
        await createAdminLog({
            admin_id: String(admin.id),
            action,
            target_type: targetType,
            target_id: String(targetId),
            meta
        });
    } catch (error) {
        // Logging should never block primary admin actions.
        console.error(error);
    }
};

export const getAdminLogList = async (query = {}) => {
    const { page, limit, skip } = normalizePagination(query);
    const filter = {};

    if (query.admin_id !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(String(query.admin_id))) {
            throw createHttpError(400, "errors.user_id_invalid");
        }
        filter.admin_id = query.admin_id;
    }

    if (query.action !== undefined) {
        if (!ADMIN_LOG_ALLOWED_ACTIONS.includes(query.action)) {
            throw createHttpError(400, "errors.admin_log_action_invalid");
        }
        filter.action = query.action;
    }

    if (query.target_type !== undefined) {
        if (!ADMIN_LOG_ALLOWED_TARGET_TYPES.includes(query.target_type)) {
            throw createHttpError(400, "errors.admin_log_target_type_invalid");
        }
        filter.target_type = query.target_type;
    }

    if (query.target_id !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(String(query.target_id))) {
            throw createHttpError(400, "errors.id_invalid");
        }
        filter.target_id = query.target_id;
    }

    const fromDate = parseOptionalDate(query.from);
    const toDate = parseOptionalDate(query.to);
    if (fromDate && toDate && fromDate > toDate) {
        throw createHttpError(400, "errors.date_range_invalid");
    }

    if (fromDate || toDate) {
        filter.created_at = {};
        if (fromDate) filter.created_at.$gte = fromDate;
        if (toDate) filter.created_at.$lte = toDate;
    }

    const [items, total] = await Promise.all([
        AdminLog.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        AdminLog.countDocuments(filter)
    ]);

    return {
        items: items.map(mapAdminLogResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};
