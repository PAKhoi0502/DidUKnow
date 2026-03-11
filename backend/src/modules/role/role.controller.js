import {
    createRole,
    deleteRoleById,
    getAllRoles,
    updateRoleById
} from "./role.service.js";

export const getRolesController = async (req, res, next) => {
    try {
        const roles = await getAllRoles();
        return res.status(200).json({
            message: "Get roles successfully",
            data: roles
        });
    } catch (error) {
        return next(error);
    }
};

export const createRoleController = async (req, res, next) => {
    try {
        const role = await createRole(req.validatedBody);
        return res.status(201).json({
            message: "Create role successfully",
            data: role
        });
    } catch (error) {
        return next(error);
    }
};

export const updateRoleController = async (req, res, next) => {
    try {
        const role = await updateRoleById(req.params.id, req.validatedBody);
        return res.status(200).json({
            message: "Update role successfully",
            data: role
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteRoleController = async (req, res, next) => {
    try {
        const role = await deleteRoleById(req.params.id);
        return res.status(200).json({
            message: "Delete role successfully",
            data: role
        });
    } catch (error) {
        return next(error);
    }
};
