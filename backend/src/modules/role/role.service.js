import Role from "./role.model.js";
import User from "../user/user.model.js";

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
        const error = new Error("Role name already exists");
        error.status = 409;
        throw error;
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
            const error = new Error("Role name already exists");
            error.status = 409;
            throw error;
        }
    }

    const role = await Role.findByIdAndUpdate(
        roleId,
        payload,
        { new: true }
    );

    if (!role) {
        const error = new Error("Role not found");
        error.status = 404;
        throw error;
    }

    return mapRoleResponse(role.toObject());
};

export const deleteRoleById = async (roleId) => {
    const isRoleInUse = await User.exists({ role_id: roleId });
    if (isRoleInUse) {
        const error = new Error("Cannot delete role because it is being used by users");
        error.status = 409;
        throw error;
    }

    const role = await Role.findByIdAndDelete(roleId);

    if (!role) {
        const error = new Error("Role not found");
        error.status = 404;
        throw error;
    }

    return mapRoleResponse(role.toObject());
};
