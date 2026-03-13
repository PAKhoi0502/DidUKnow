import User from "./user.model.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";
import { generateAccessToken } from "../../utils/generateToken.js";
import Role from "../role/role.model.js";
import UserRoleAudit from "./userRoleAudit.model.js";
import { createHttpError } from "../../utils/httpError.js";

const mapUserResponse = (userDoc) => {
    return {
        id: userDoc._id,
        username: userDoc.username,
        email: userDoc.email,
        avatar_url: userDoc.avatar_url,
        language: userDoc.language,
        status: userDoc.status,
        role_id: userDoc.role_id,
        email_verified_at: userDoc.email_verified_at,
        last_login_at: userDoc.last_login_at,
        created_at: userDoc.created_at,
        updated_at: userDoc.updated_at
    };
};

export const getAllUsers = async () => {
    const users = await User.find({})
        .sort({ created_at: -1 })
        .lean();

    return users.map(mapUserResponse);
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

    return mapUserResponse(user.toObject());
};

export const loginUser = async (payload) => {
    const user = await User.findOne({ email: payload.email });

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

    return {
        access_token: token,
        user: mapUserResponse(user.toObject())
    };
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
