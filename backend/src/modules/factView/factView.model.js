import mongoose from "mongoose";

const factViewSchema = new mongoose.Schema(
    {
        fact_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fact",
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        ip_hash: {
            type: String,
            default: null
        },
        view_date: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false
        }
    }
);

factViewSchema.index({ fact_id: 1, created_at: -1 });
factViewSchema.index({ user_id: 1, created_at: -1 });
factViewSchema.index({ view_date: 1, fact_id: 1 });

export default mongoose.model("FactView", factViewSchema);
