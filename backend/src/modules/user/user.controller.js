import {
    createUser,
    deleteUserById,
    getAllUsers,
    getUserById,
    loginUser,
    logoutUserSession,
    refreshUserSession,
    updateUserById,
    updateUserRoleById,
    updateUserLanguage
} from "./user.service.js";
import {
    REFRESH_TOKEN_COOKIE_NAME,
    refreshTokenCookieOptions
} from "../../utils/refreshTokenCookie.js";

export const getUsersController = async (req, res, next) => {
    try {
        const users = await getAllUsers(req.query);
        return res.status(200).json({
            message: "users.get_success",
            data: users
        });
    } catch (error) {
        return next(error);
    }
};

export const createUserController = async (req, res, next) => {
    try {
        const user = await createUser(req.validatedBody);
        return res.status(201).json({
            message: "users.create_success",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};

export const loginUserController = async (req, res, next) => {
    try {
        const loginData = await loginUser(req.validatedBody);
        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            loginData.refresh_token,
            refreshTokenCookieOptions
        );
        return res.status(200).json({
            message: "auth.login_success",
            data: {
                access_token: loginData.access_token,
                user: loginData.user
            }
        });
    } catch (error) {
        return next(error);
    }
};

export const refreshUserTokenController = async (req, res, next) => {
    try {
        const sessionData = await refreshUserSession(req.validatedBody.refresh_token);
        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            sessionData.refresh_token,
            refreshTokenCookieOptions
        );
        return res.status(200).json({
            message: "auth.refresh_success",
            data: {
                access_token: sessionData.access_token,
                user: sessionData.user
            }
        });
    } catch (error) {
        return next(error);
    }
};

export const logoutUserController = async (req, res, next) => {
    try {
        await logoutUserSession(req.validatedBody.refresh_token);
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: refreshTokenCookieOptions.httpOnly,
            secure: refreshTokenCookieOptions.secure,
            sameSite: refreshTokenCookieOptions.sameSite,
            path: refreshTokenCookieOptions.path
        });

        return res.status(200).json({
            message: "auth.logout_success"
        });
    } catch (error) {
        return next(error);
    }
};

export const updateMyLanguageController = async (req, res, next) => {
    try {
        const user = await updateUserLanguage(req.user.id, req.validatedBody.language);
        return res.status(200).json({
            message: "users.update_language_success",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};

export const getMyProfileController = async (req, res, next) => {
    try {
        const user = await getUserById(req.user.id);
        return res.status(200).json({
            message: "users.get_profile_success",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};

export const updateMyProfileController = async (req, res, next) => {
    try {
        const user = await updateUserById(req.user.id, req.validatedBody);
        return res.status(200).json({
            message: "users.update_profile_success",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};

export const updateUserController = async (req, res, next) => {
    try {
        const user = await updateUserById(req.params.id, req.validatedBody);
        return res.status(200).json({
            message: "users.update_success",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};

export const updateUserRoleController = async (req, res, next) => {
    try {
        const result = await updateUserRoleById(
            req.params.id,
            req.validatedBody.role_id,
            {
                actor_user_id: req.user?.id,
                ip_address: req.ip,
                user_agent: req.headers["user-agent"] || null,
                reason: req.validatedBody?.reason || null
            }
        );
        return res.status(200).json({
            message: "users.update_role_success",
            data: result.user,
            audit: result.audit
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteUserController = async (req, res, next) => {
    try {
        const user = await deleteUserById(req.params.id);
        return res.status(200).json({
            message: "users.delete_success",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};
