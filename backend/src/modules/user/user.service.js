import crypto from "crypto";
import User from "./user.model.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from "../../utils/generateToken.js";
import Role from "../role/role.model.js";
import UserRoleAudit from "./userRoleAudit.model.js";
import RefreshToken from "./refreshToken.model.js";
import { createHttpError } from "../../utils/httpError.js";

const mapUserResponse = (userDoc) => {
    const populatedRole = (
        userDoc?.role_id
        && typeof userDoc.role_id === "object"
        && userDoc.role_id !== null
        && userDoc.role_id._id
    )
        ? userDoc.role_id
        : null;

    return {
        id: userDoc._id,
        username: userDoc.username,
        email: userDoc.email,
        avatar_url: userDoc.avatar_url,
        language: userDoc.language,
        status: userDoc.status,
        role_id: populatedRole ? populatedRole._id : userDoc.role_id,
        role_name: populatedRole?.name ?? null,
        email_verified_at: userDoc.email_verified_at,
        last_login_at: userDoc.last_login_at,
        created_at: userDoc.created_at,
        updated_at: userDoc.updated_at
    };
};

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const createRefreshTokenRecord = async (userId) => {
    const tokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken({
        user_id: userId.toString(),
        token_id: tokenId
    });
    const payload = verifyRefreshToken(refreshToken);

    if (!payload?.exp) {
        throw createHttpError(500, "errors.internal_server_error");
    }

    const refreshTokenDoc = await RefreshToken.create({
        user_id: userId,
        token_hash: hashToken(refreshToken),
        expires_at: new Date(payload.exp * 1000)
    });

    return {
        refresh_token: refreshToken,
        refresh_token_doc: refreshTokenDoc
    };
};

const revokeAllUserRefreshTokens = async (userId) => {
    await RefreshToken.updateMany(
        {
            user_id: userId,
            revoked_at: null
        },
        {
            $set: {
                revoked_at: new Date()
            }
        }
    );
};

const LIST_DEFAULT_PAGE = 1;
const LIST_DEFAULT_LIMIT = 10;
const LIST_MAX_LIMIT = 100;

const parsePositiveInt = (rawValue, fallback) => {
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
};

const escapeRegex = (value) => {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const getAllUsers = async (query = {}) => {
    const page = parsePositiveInt(query.page, LIST_DEFAULT_PAGE);
    const requestedLimit = parsePositiveInt(query.limit, LIST_DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, LIST_MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.status !== undefined) {
        filter.status = query.status;
    }

    if (query.role_id !== undefined) {
        filter.role_id = query.role_id;
    }

    const rawSearch = typeof query.search === "string" ? query.search.trim() : "";
    if (rawSearch.length > 0) {
        const searchRegex = new RegExp(escapeRegex(rawSearch), "i");
        const matchedRoles = await Role.find({ name: searchRegex }).select("_id").lean();
        const matchedRoleIds = matchedRoles.map((role) => role._id);

        filter.$or = [
            { username: searchRegex },
            { email: searchRegex },
            ...(matchedRoleIds.length > 0 ? [{ role_id: { $in: matchedRoleIds } }] : [])
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .populate("role_id", "name status")
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ]);

    return {
        items: users.map(mapUserResponse),
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    };
};

export const createUser = async (payload) => {
    const existed = await User.findOne({
        $or: [{ username: payload.username }, { email: payload.email }]
    }).lean();

    if (existed) {
        throw createHttpError(409, "errors.user_duplicate");
    }

    const defaultUserRole = await Role.findOne({
        name: { $regex: /^user$/i },
        status: "active"
    }).lean();

    if (!defaultUserRole) {
        throw createHttpError(500, "errors.default_user_role_missing");
    }

    const user = await User.create({
        username: payload.username,
        email: payload.email,
        password_hash: await hashPassword(payload.password),
        avatar_url: payload.avatar_url,
        language: payload.language,
        role_id: defaultUserRole._id
    });

    return {
        ...mapUserResponse(user.toObject()),
        role_name: defaultUserRole.name
    };
};

export const loginUser = async (payload) => {
    const user = await User.findOne({ email: payload.email })
        .populate("role_id", "name status");

    if (!user) {
        throw createHttpError(401, "errors.invalid_credentials");
    }

    const isPasswordValid = await comparePassword(payload.password, user.password_hash);
    if (!isPasswordValid) {
        throw createHttpError(401, "errors.invalid_credentials");
    }

    user.last_login_at = new Date();
    await user.save();

    const token = generateAccessToken({
        user_id: user._id.toString()
    });
    const refreshData = await createRefreshTokenRecord(user._id);

    return {
        access_token: token,
        refresh_token: refreshData.refresh_token,
        user: mapUserResponse(user.toObject())
    };
};

export const refreshUserSession = async (refreshToken) => {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload?.user_id || !payload?.token_id) {
        throw createHttpError(401, "errors.invalid_or_expired_token");
    }

    const existingRefreshToken = await RefreshToken.findOne({
        token_hash: hashToken(refreshToken)
    });

    if (!existingRefreshToken) {
        throw createHttpError(401, "errors.invalid_or_expired_token");
    }

    if (existingRefreshToken.revoked_at || existingRefreshToken.expires_at <= new Date()) {
        await revokeAllUserRefreshTokens(existingRefreshToken.user_id);
        throw createHttpError(401, "errors.invalid_or_expired_token");
    }

    const user = await User.findById(payload.user_id)
        .populate("role_id", "name status");

    if (!user) {
        throw createHttpError(401, "errors.user_not_found");
    }

    if (user.status !== "active") {
        throw createHttpError(403, "errors.user_not_active");
    }

    const newAccessToken = generateAccessToken({
        user_id: user._id.toString()
    });
    const newRefreshData = await createRefreshTokenRecord(user._id);

    existingRefreshToken.revoked_at = new Date();
    existingRefreshToken.replaced_by_token_id = newRefreshData.refresh_token_doc._id;
    await existingRefreshToken.save();

    return {
        access_token: newAccessToken,
        refresh_token: newRefreshData.refresh_token,
        user: mapUserResponse(user.toObject())
    };
};

export const logoutUserSession = async (refreshToken) => {
    const payload = verifyRefreshToken(refreshToken);

    if (!payload?.user_id || !payload?.token_id) {
        return;
    }

    await RefreshToken.updateOne(
        {
            token_hash: hashToken(refreshToken),
            revoked_at: null
        },
        {
            $set: {
                revoked_at: new Date()
            }
        }
    );
};

export const updateUserLanguage = async (userId, language) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { language },
        { returnDocument: "after" }
    );

    if (!user) {
        throw createHttpError(404, "errors.user_not_found");
    }

    return mapUserResponse(user.toObject());
};

export const getUserById = async (userId) => {
    const user = await User.findById(userId)
        .populate("role_id", "name status")
        .lean();

    if (!user) {
        throw createHttpError(404, "errors.user_not_found");
    }

    return mapUserResponse(user);
};

export const updateUserById = async (userId, payload) => {
    if (payload.username) {
        const existedUsername = await User.findOne({
            username: payload.username,
            _id: { $ne: userId }
        }).lean();

        if (existedUsername) {
            throw createHttpError(409, "errors.username_duplicate");
        }
    }

    if (payload.email) {
        const existedEmail = await User.findOne({
            email: payload.email,
            _id: { $ne: userId }
        }).lean();

        if (existedEmail) {
            throw createHttpError(409, "errors.email_duplicate");
        }
    }

    const updatePayload = { ...payload };

    if (updatePayload.password) {
        updatePayload.password_hash = await hashPassword(updatePayload.password);
        delete updatePayload.password;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        updatePayload,
        { returnDocument: "after" }
    );

    if (!user) {
        throw createHttpError(404, "errors.user_not_found");
    }

    return mapUserResponse(user.toObject());
};

export const updateUserRoleById = async (userId, roleId, auditContext = {}) => {
    const actorUserId = auditContext.actor_user_id;
    const ipAddress = auditContext.ip_address ?? null;
    const userAgent = auditContext.user_agent ?? null;
    const reason = auditContext.reason ?? null;

    const createAuditLog = async ({
        status,
        failureReason = null,
        targetUserId = null,
        beforeRoleId = null,
        afterRoleId = null
    }) => {
        if (!actorUserId) {
            return null;
        }

        return UserRoleAudit.create({
            actor_user_id: actorUserId,
            target_user_id: targetUserId,
            before_role_id: beforeRoleId,
            after_role_id: afterRoleId,
            reason,
            status,
            failure_reason: failureReason,
            ip_address: ipAddress,
            user_agent: userAgent
        });
    };

    try {
        const role = await Role.findById(roleId).select("_id").lean();
        if (!role) {
            await createAuditLog({
                status: "failed",
                failureReason: "role_id does not exist"
            });
            throw createHttpError(400, "errors.role_id_not_found");
        }

        const user = await User.findById(userId).select("_id role_id");
        if (!user) {
            await createAuditLog({
                status: "failed",
                failureReason: "User not found"
            });
            throw createHttpError(404, "errors.user_not_found");
        }

        const beforeRoleId = user.role_id;
        user.role_id = roleId;
        await user.save();

        const auditLog = await createAuditLog({
            status: "success",
            targetUserId: user._id,
            beforeRoleId,
            afterRoleId: roleId
        });

        return {
            user: mapUserResponse(user.toObject()),
            audit: {
                event_id: auditLog?._id?.toString() ?? null,
                status: "success"
            }
        };
    } catch (error) {
        if (!error?.status) {
            await createAuditLog({
                status: "failed",
                failureReason: error.message || "Unknown error"
            });
        }
        throw error;
    }
};

export const deleteUserById = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw createHttpError(404, "errors.user_not_found");
    }

    return mapUserResponse(deletedUser.toObject());
};
