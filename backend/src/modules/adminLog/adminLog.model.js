import mongoose from "mongoose";

export const ADMIN_LOG_ACTION = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    STATUS_UPDATE: "status_update"
};

export const ADMIN_LOG_TARGET_TYPE = {
    FACT: "fact",
    TAG: "tag",
    CATEGORY: "category",
    REPORT_FACT: "report_fact",
    USER: "user",
    ROLE: "role",
    COMMENT: "comment",
    BOOKMARK_COLLECTION: "bookmark_collection"
};

export const ADMIN_LOG_ALLOWED_ACTIONS = Object.values(ADMIN_LOG_ACTION);
export const ADMIN_LOG_ALLOWED_TARGET_TYPES = Object.values(ADMIN_LOG_TARGET_TYPE);

const adminLogSchema = new mongoose.Schema(
    {
        admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: String,
            enum: ADMIN_LOG_ALLOWED_ACTIONS,
            required: true
        },
        target_type: {
            type: String,
            enum: ADMIN_LOG_ALLOWED_TARGET_TYPES,
            required: true
        },
        target_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
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

adminLogSchema.index({ admin_id: 1, created_at: -1 });
adminLogSchema.index({ target_type: 1, target_id: 1, created_at: -1 });
adminLogSchema.index({ action: 1, created_at: -1 });
adminLogSchema.index({ created_at: -1 });

export default mongoose.model("AdminLog", adminLogSchema);
