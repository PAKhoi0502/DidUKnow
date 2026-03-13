import Role from "../modules/role/role.model.js";
import { createHttpError } from "../utils/httpError.js";

export const authorizeRoles = (...allowedRoles) => {
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    return async (req, res, next) => {
        if (!req.user?.role_id) {
            return res.status(401).json({
                message: "errors.unauthorized"
            });
        }

        try {
            const role = await Role.findById(req.user.role_id)
                .select("name status")
                .lean();

            if (!role) {
                return res.status(403).json({
                    message: "errors.forbidden"
                });
            }

            if (role.status !== "active") {
                return res.status(403).json({
                    message: "errors.role_not_active"
                });
            }

            const normalizedRoleName = String(role.name || "").toLowerCase();
            if (!normalizedAllowedRoles.includes(normalizedRoleName)) {
                return res.status(403).json({
                    message: "errors.forbidden"
                });
            }

            req.user.role_name = role.name;
            return next();
        } catch (error) {
            return next(createHttpError(500, "errors.internal_server_error"));
        }
    };
};
