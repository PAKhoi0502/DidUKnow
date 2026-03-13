import mongoose from "mongoose";

export const REPORT_FACT_STATUS = {
    PENDING: "pending",
    REVIEWING: "reviewing",
    RESOLVED: "resolved",
    REJECTED: "rejected"
};

export const REPORT_FACT_ALLOWED_STATUSES = Object.values(REPORT_FACT_STATUS);

const reportFactSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        fact_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fact",
            required: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: REPORT_FACT_ALLOWED_STATUSES,
            default: REPORT_FACT_STATUS.PENDING
        },
        resolved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        resolution_note: {
            type: String,
            default: null
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

reportFactSchema.index({ user_id: 1, created_at: -1 });
reportFactSchema.index({ fact_id: 1, created_at: -1 });
reportFactSchema.index({ status: 1, created_at: -1 });
reportFactSchema.index({ user_id: 1, fact_id: 1, status: 1 });

export default mongoose.model("ReportFact", reportFactSchema);
