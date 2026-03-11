import User from "./user.model.js";
import { comparePassword, hashPassword } from "../../utils/hashPassword.js";
import { generateAccessToken } from "../../utils/generateToken.js";
import Role from "../role/role.model.js";

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
        const error = new Error("Username or email already exists");
        error.status = 409;
        throw error;
    }

    const defaultUserRole = await Role.findOne({
        name: { $regex: /^user$/i },
        status: "active"
    }).lean();

    if (!defaultUserRole) {
        const error = new Error("Default 'User' role is not configured");
        error.status = 500;
        throw error;
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
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    const isPasswordValid = await comparePassword(payload.password, user.password_hash);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
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
        { new: true }
    );

    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
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
            const error = new Error("Username already exists");
            error.status = 409;
            throw error;
        }
    }

    if (payload.email) {
        const existedEmail = await User.findOne({
            email: payload.email,
            _id: { $ne: userId }
        }).lean();

        if (existedEmail) {
            const error = new Error("Email already exists");
            error.status = 409;
            throw error;
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
        { new: true }
    );

    if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return mapUserResponse(user.toObject());
};

export const deleteUserById = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return mapUserResponse(deletedUser.toObject());
};
