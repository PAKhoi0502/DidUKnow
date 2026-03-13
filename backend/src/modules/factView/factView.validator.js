import mongoose from "mongoose";

export const validateFactIdParam = (req, res, next) => {
    const { fact_id: factId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(factId)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.fact_id_invalid"]
        });
    }

    return next();
};

const isValidDateString = (rawValue) => {
    if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
        return false;
    }

    const parsed = new Date(rawValue);
    return !Number.isNaN(parsed.getTime());
};

export const validateFactViewSummaryQuery = (req, res, next) => {
    const { from, to } = req.query || {};
    const errors = [];

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

    return next();
};
