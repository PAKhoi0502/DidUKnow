import User from "../modules/user/user.model.js";
import { verifyAccessToken } from "../utils/generateToken.js";

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyAccessToken(token);

    if (!payload?.user_id) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    try {
        const user = await User.findById(payload.user_id)
            .select("_id role_id language status")
            .lean();

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        if (user.status !== "active") {
            return res.status(403).json({
                message: "User account is not active"
            });
        }

        req.user = {
            id: user._id.toString(),
            role_id: user.role_id?.toString() ?? null,
            language: user.language
        };

        return next();
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
