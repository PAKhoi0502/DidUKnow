import {
    createRole,
    deleteRoleById,
    getAllRoles,
    updateRoleById
} from "./role.service.js";

export const getRolesController = async (req, res) => {
    try {
        const roles = await getAllRoles();
        return res.status(200).json({
            message: "Get roles successfully",
            data: roles
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const createRoleController = async (req, res) => {
    try {
        const role = await createRole(req.validatedBody);
        return res.status(201).json({
            message: "Create role successfully",
            data: role
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const updateRoleController = async (req, res) => {
    try {
        const role = await updateRoleById(req.params.id, req.validatedBody);
        return res.status(200).json({
            message: "Update role successfully",
            data: role
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};

export const deleteRoleController = async (req, res) => {
    try {
        const role = await deleteRoleById(req.params.id);
        return res.status(200).json({
            message: "Delete role successfully",
            data: role
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error"
        });
    }
};
