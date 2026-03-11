import {
    createUser,
    deleteUserById,
    getAllUsers,
    loginUser,
    updateUserById,
    updateUserLanguage
} from "./user.service.js";

export const getUsersController = async (req, res) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json({
            message: "Get users successfully",
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const createUserController = async (req, res) => {
    try {
        const user = await createUser(req.validatedBody);
        return res.status(201).json({
            message: "Create user successfully",
            data: user
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const loginUserController = async (req, res) => {
    try {
        const loginData = await loginUser(req.validatedBody);
        return res.status(200).json({
            message: "Login successfully",
            data: loginData
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const updateMyLanguageController = async (req, res) => {
    try {
        const user = await updateUserLanguage(req.user.id, req.validatedBody.language);
        return res.status(200).json({
            message: "Update language successfully",
            data: user
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const updateUserController = async (req, res) => {
    try {
        const user = await updateUserById(req.params.id, req.validatedBody);
        return res.status(200).json({
            message: "Update user successfully",
            data: user
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const deleteUserController = async (req, res) => {
    try {
        const user = await deleteUserById(req.params.id);
        return res.status(200).json({
            message: "Delete user successfully",
            data: user
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};
