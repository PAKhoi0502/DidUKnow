import mongoose from "mongoose";

export const validateCreateRole = (req, res, next) => {
    const { name, description, status } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("name must be at least 2 characters");
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.push("description must be a string");
    }

    if (status !== undefined && !["active", "inactive"].includes(status)) {
        errors.push("status must be active or inactive");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        name: name.trim(),
        description: description ?? null,
        status: status ?? "active"
    };

    return next();
};

export const validateRoleIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["id must be a valid ObjectId"]
        });
    }

    return next();
};

export const validateUpdateRole = (req, res, next) => {
    const payload = req.body || {};
    const inputKeys = Object.keys(payload);
    const allowedFields = ["name", "description", "status"];

    if (inputKeys.length === 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["At least one field is required for update"]
        });
    }

    const invalidFields = inputKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: [`Invalid fields: ${invalidFields.join(", ")}`]
        });
    }

    const { name, description, status } = payload;
    const errors = [];

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
        errors.push("name must be at least 2 characters");
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.push("description must be a string");
    }

    if (status !== undefined && !["active", "inactive"].includes(status)) {
        errors.push("status must be active or inactive");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors
        });
    }

    req.validatedBody = {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {})
    };

    return next();
};
