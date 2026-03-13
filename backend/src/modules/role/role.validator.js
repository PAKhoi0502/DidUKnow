import mongoose from "mongoose";

export const validateCreateRole = (req, res, next) => {
    const { name, description, status } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
        errors.push("errors.role_name_min_length_2");
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.push("errors.description_string");
    }

    if (status !== undefined && !["active", "inactive"].includes(status)) {
        errors.push("errors.role_status_invalid_active_inactive");
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
            errors: ["errors.id_invalid"]
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
            errors: ["errors.update_payload_required"]
        });
    }

    const invalidFields = inputKeys.filter((key) => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: "errors.validation_failed",
            errors: ["errors.invalid_fields"],
            details: { invalid_fields: invalidFields }
        });
    }

    const { name, description, status } = payload;
    const errors = [];

    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
        errors.push("errors.role_name_min_length_2");
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        errors.push("errors.description_string");
    }

    if (status !== undefined && !["active", "inactive"].includes(status)) {
        errors.push("errors.role_status_invalid_active_inactive");
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
