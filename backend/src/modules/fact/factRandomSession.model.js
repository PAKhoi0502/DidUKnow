import mongoose from "mongoose";

const factRandomSessionSchema = new mongoose.Schema(
    {
        scope_key: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },
        remaining_fact_ids: {
            type: [mongoose.Schema.Types.ObjectId],
            default: []
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

factRandomSessionSchema.index({ user_id: 1, category_id: 1 });

export default mongoose.model("FactRandomSession", factRandomSessionSchema);
