import mongoose from "mongoose";
import { REPORT_FACT_ALLOWED_STATUSES } from "./reportFact.model.js";

const createAllowedFields = ["fact_id", "reason"];
const updateStatusAllowedFields = ["status", "resolution_note"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

export const validateCreateReportFact = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, createAllowedFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const { fact_id: factId, reason } = payload;
    const errors = [];

    if (!inputKeys.includes("fact_id")) {
        errors.push("errors.fact_id_required");
    } else if (typeof factId !== "string" || !mongoose.Types.ObjectId.isValid(factId)) {
        errors.push("errors.fact_id_invalid");
    }

    if (!inputKeys.includes("reason")) {
        errors.push("errors.report_reason_required");
    } else if (typeof reason !== "string" || reason.trim().length < 10 || reason.trim().length > 1000) {
        errors.push("errors.report_reason_length_invalid");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        fact_id: factId.trim(),
        reason: reason.trim()
    };

    return next();
};

export const validateReportIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.id_invalid"]
        });
    }

    return next();
};

export const validateReportFactStatusUpdate = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, updateStatusAllowedFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const { status, resolution_note: resolutionNote } = payload;
    const errors = [];

    if (!inputKeys.includes("status")) {
        errors.push("errors.status_required");
    } else if (!REPORT_FACT_ALLOWED_STATUSES.includes(status)) {
        errors.push("errors.report_fact_status_invalid");
    }

    if (resolutionNote !== undefined && resolutionNote !== null) {
        if (typeof resolutionNote !== "string" || resolutionNote.trim().length > 1000) {
            errors.push("errors.report_resolution_note_invalid");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        status,
        ...(resolutionNote !== undefined
            ? { resolution_note: resolutionNote === null ? null : resolutionNote.trim() }
            : {})
    };

    return next();
};

export const validateReportFactListQuery = (req, res, next) => {
    const { status, fact_id: factId, user_id: userId } = req.query || {};
    const errors = [];

    if (status !== undefined && !REPORT_FACT_ALLOWED_STATUSES.includes(String(status))) {
        errors.push("errors.report_fact_status_invalid");
    }

    if (factId !== undefined && !mongoose.Types.ObjectId.isValid(String(factId))) {
        errors.push("errors.fact_id_invalid");
    }

    if (userId !== undefined && !mongoose.Types.ObjectId.isValid(String(userId))) {
        errors.push("errors.user_id_invalid");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    if (status !== undefined) {
        req.query.status = String(status);
    }
    if (factId !== undefined) {
        req.query.fact_id = String(factId);
    }
    if (userId !== undefined) {
        req.query.user_id = String(userId);
    }

    return next();
};
