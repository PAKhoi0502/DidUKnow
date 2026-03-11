import mongoose from "mongoose";

const userRoleAuditSchema = new mongoose.Schema(
    {
        event_type: {
            type: String,
            default: "USER_ROLE_CHANGED"
        },
        actor_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        target_user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        before_role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            default: null
        },
        after_role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            default: null
        },
        reason: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["success", "failed"],
            required: true
        },
        failure_reason: {
            type: String,
            default: null
        },
        ip_address: {
            type: String,
            default: null
        },
        user_agent: {
            type: String,
            default: null
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false
        }
    }
);

userRoleAuditSchema.index({ target_user_id: 1, created_at: -1 });
userRoleAuditSchema.index({ actor_user_id: 1, created_at: -1 });
userRoleAuditSchema.index({ event_type: 1, created_at: -1 });

export default mongoose.model("UserRoleAudit", userRoleAuditSchema);
