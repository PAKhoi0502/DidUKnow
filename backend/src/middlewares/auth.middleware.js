import User from "../modules/user/user.model.js";
import { verifyAccessToken } from "../utils/generateToken.js";
import { createHttpError } from "../utils/httpError.js";

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createHttpError(401, "Unauthorized"));
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyAccessToken(token);

    if (!payload?.user_id) {
        return next(createHttpError(401, "Invalid or expired token"));
    }

    try {
        const user = await User.findById(payload.user_id)
            .select("_id role_id language status")
            .lean();

        if (!user) {
            return next(createHttpError(401, "User not found"));
        }

        if (user.status !== "active") {
            return next(createHttpError(403, "User account is not active"));
        }

        req.user = {
            id: user._id.toString(),
            role_id: user.role_id?.toString() ?? null,
            language: user.language
        };

        return next();
    } catch (error) {
        return next(error);
    }
};
