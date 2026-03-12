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
            message: "roles.get_success",
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
            message: "roles.create_success",
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
            message: "roles.update_success",
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
            message: "roles.delete_success",
            data: role
        });
    } catch (error) {
        return next(error);
    }
};
