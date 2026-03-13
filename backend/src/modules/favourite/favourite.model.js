import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
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
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

favouriteSchema.index({ user_id: 1, fact_id: 1 }, { unique: true });
favouriteSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.model("Favourite", favouriteSchema);
