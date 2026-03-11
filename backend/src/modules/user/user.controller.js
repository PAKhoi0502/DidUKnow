import {
    createUser,
    deleteUserById,
    getAllUsers,
    loginUser,
    updateUserById,
    updateUserRoleById,
    updateUserLanguage
} from "./user.service.js";

export const getUsersController = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json({
            message: "Get users successfully",
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
            message: "Create user successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};

export const loginUserController = async (req, res, next) => {
    try {
        const loginData = await loginUser(req.validatedBody);
        return res.status(200).json({
            message: "Login successfully",
            data: loginData
        });
    } catch (error) {
        return next(error);
    }
};

export const updateMyLanguageController = async (req, res, next) => {
    try {
        const user = await updateUserLanguage(req.user.id, req.validatedBody.language);
        return res.status(200).json({
            message: "Update language successfully",
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
            message: "Update user successfully",
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
            message: "Update user role successfully",
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
            message: "Delete user successfully",
            data: user
        });
    } catch (error) {
        return next(error);
    }
};
