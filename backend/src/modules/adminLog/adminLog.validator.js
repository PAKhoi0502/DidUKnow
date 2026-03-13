import mongoose from "mongoose";
import {
    ADMIN_LOG_ALLOWED_ACTIONS,
    ADMIN_LOG_ALLOWED_TARGET_TYPES
} from "./adminLog.model.js";

const isValidDateString = (rawValue) => {
    if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
        return false;
    }

    const parsed = new Date(rawValue);
    return !Number.isNaN(parsed.getTime());
};

export const validateAdminLogListQuery = (req, res, next) => {
    const {
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        from,
        to
    } = req.query || {};

    const errors = [];

    if (adminId !== undefined && !mongoose.Types.ObjectId.isValid(String(adminId))) {
        errors.push("errors.user_id_invalid");
    }

    if (action !== undefined && !ADMIN_LOG_ALLOWED_ACTIONS.includes(String(action))) {
        errors.push("errors.admin_log_action_invalid");
    }

    if (targetType !== undefined && !ADMIN_LOG_ALLOWED_TARGET_TYPES.includes(String(targetType))) {
        errors.push("errors.admin_log_target_type_invalid");
    }

    if (targetId !== undefined && !mongoose.Types.ObjectId.isValid(String(targetId))) {
        errors.push("errors.id_invalid");
    }

    if (from !== undefined && !isValidDateString(String(from))) {
        errors.push("errors.date_invalid");
    }

    if (to !== undefined && !isValidDateString(String(to))) {
        errors.push("errors.date_invalid");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    if (adminId !== undefined) req.query.admin_id = String(adminId);
    if (action !== undefined) req.query.action = String(action);
    if (targetType !== undefined) req.query.target_type = String(targetType);
    if (targetId !== undefined) req.query.target_id = String(targetId);
    if (from !== undefined) req.query.from = String(from);
    if (to !== undefined) req.query.to = String(to);

    return next();
};
