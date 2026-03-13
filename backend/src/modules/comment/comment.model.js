import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
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
        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: false
        }
    }
);

commentSchema.index({ fact_id: 1, created_at: -1 });
commentSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.model("Comment", commentSchema);
