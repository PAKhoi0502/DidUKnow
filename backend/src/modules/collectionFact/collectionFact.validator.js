import mongoose from "mongoose";

const createAllowedFields = ["collection_id", "fact_id"];

const getInvalidFields = (payload, allowedFields) => {
    const inputKeys = Object.keys(payload || {});
    return inputKeys.filter((key) => !allowedFields.includes(key));
};

export const validateCreateCollectionFact = (req, res, next) => {
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

    const errors = [];
    const { collection_id: collectionId, fact_id: factId } = payload;

    if (!inputKeys.includes("collection_id")) {
        errors.push("errors.collection_id_required");
    } else if (typeof collectionId !== "string" || !mongoose.Types.ObjectId.isValid(collectionId)) {
        errors.push("errors.collection_id_invalid");
    }

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
        collection_id: collectionId.trim(),
        fact_id: factId.trim()
    };
    return next();
};

export const validateCollectionIdParam = (req, res, next) => {
    const { collection_id: collectionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.collection_id_invalid"]
        });
    }
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
