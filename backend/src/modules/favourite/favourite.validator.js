import mongoose from "mongoose";

const createAllowedFields = ["fact_id"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

export const validateCreateFavourite = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const invalidFields = getInvalidFields(payload, createAllowedFields);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const { fact_id: factId } = payload;
    const errors = [];

    if (!inputKeys.includes("fact_id")) {
        errors.push("errors.fact_id_required");
    } else if (typeof factId !== "string" || !mongoose.Types.ObjectId.isValid(factId)) {
        errors.push("errors.fact_id_invalid");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        fact_id: factId
    };

    return next();
};

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
