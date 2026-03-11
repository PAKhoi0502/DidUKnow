import Role from "../modules/role/role.model.js";

export const authorizeRoles = (...allowedRoles) => {
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    return async (req, res, next) => {
        if (!req.user?.role_id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        try {
            const role = await Role.findById(req.user.role_id)
                .select("name status")
                .lean();

            if (!role) {
                return res.status(403).json({
                    message: "Forbidden"
                });
            }

            if (role.status !== "active") {
                return res.status(403).json({
                    message: "Role is not active"
                });
            }

            const normalizedRoleName = String(role.name || "").toLowerCase();
            if (!normalizedAllowedRoles.includes(normalizedRoleName)) {
                return res.status(403).json({
                    message: "Forbidden"
                });
            }

            req.user.role_name = role.name;
            return next();
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error",
                error: error.message
            });
        }
    };
};
