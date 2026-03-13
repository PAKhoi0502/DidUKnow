import Role from "./role.model.js";
import User from "../user/user.model.js";
import { createHttpError } from "../../utils/httpError.js";

const mapRoleResponse = (roleDoc) => {
    return {
        id: roleDoc._id,
        name: roleDoc.name,
        description: roleDoc.description,
        status: roleDoc.status,
        created_at: roleDoc.created_at,
        updated_at: roleDoc.updated_at
    };
};

export const getAllRoles = async () => {
    const roles = await Role.find({}).sort({ created_at: -1 }).lean();
    return roles.map(mapRoleResponse);
};

export const createRole = async (payload) => {
    const existed = await Role.findOne({ name: payload.name }).lean();

    if (existed) {
        throw createHttpError(409, "errors.role_name_duplicate");
    }

    const role = await Role.create({
        name: payload.name,
        description: payload.description,
        status: payload.status
    });

    return mapRoleResponse(role.toObject());
};

export const updateRoleById = async (roleId, payload) => {
    if (payload.name) {
        const existedName = await Role.findOne({
            name: payload.name,
            _id: { $ne: roleId }
        }).lean();

        if (existedName) {
            throw createHttpError(409, "errors.role_name_duplicate");
        }
    }

    const role = await Role.findByIdAndUpdate(
        roleId,
        payload,
        { returnDocument: "after" }
    );

    if (!role) {
        throw createHttpError(404, "errors.role_not_found");
    }

    return mapRoleResponse(role.toObject());
};

export const deleteRoleById = async (roleId) => {
    const isRoleInUse = await User.exists({ role_id: roleId });
    if (isRoleInUse) {
        throw createHttpError(409, "errors.role_in_use");
    }

    const role = await Role.findByIdAndDelete(roleId);

    if (!role) {
        throw createHttpError(404, "errors.role_not_found");
    }

    return mapRoleResponse(role.toObject());
};
